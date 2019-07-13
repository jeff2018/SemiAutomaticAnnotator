import requests
import json
import logging
import time
import os

class SpeechmaticsError(Exception):


    def __init__(self, msg, returncode=1):
        super(SpeechmaticsError, self).__init__(msg)
        self.msg = msg
        self.returncode = returncode

    def __str__(self):
        return self.msg






class SpeechmaticsClient(object):

    def __init__(self, api_user_id, api_token, base_url):
        self.api_user_id = api_user_id
        self.api_token = api_token
        self.base_url = base_url


    def job_post(self,filePath,language):
        url = "".join([self.base_url, '/user/', self.api_user_id, '/jobs/'])
        params = {'auth_token': self.api_token}

        try:
            files = {'data_file': open(filePath, "rb")}
        except IOError as ex:
            logging.error("Problem opening audio file")
            raise

        data ={"model": language}
        data['notification'] = 'none'
        data['notification_email_address'] = None
        data['diarisation'] = 'false'

        request = requests.post(url, data=data, files=files, params=params)

        if request.status_code == 200:
            json_out=json.loads(request.text)
            return json_out['id']

        else:
            err_msg ="Attempt to POST job failed with code {}\n".format(request.status_code)
            return err_msg


    def job_details(self, job_id):
        params = {'auth_token': self.api_token}

        url = "".join([self.base_url, '/user/', self.api_user_id, '/jobs/',str(job_id),'/'])
        print(url)
        request = requests.get(url, params=params)
        print(request)
        if request.status_code == 200:
            return json.loads(request.text)['job']
        else:
            err_msg = ("Attempt to GET job details failed with code {}\n").format(request.status_code)
            return err_msg

    def get_output(self, job_id,job_type):
        params = {'auth_token': self.api_token}
        if job_type == 'transcript':
            params['format'] = 'txt'

        url = "".join([self.base_url, '/user/', self.api_user_id, '/jobs/',str(job_id),'/',job_type])
        print(url)
        print(params)
        request = requests.get(url, params=params)
        if request.status_code == 200:
            request.encoding = 'utf-8'

            try:
                content = request.text.splitlines()[-1]

                return content
            except:
                return request.text
        else:
            err_msg = ("Attempt to GET job details failed with code {}\n").format(request.status_code)
            return err_msg

    def get_jsonOutput(self, job_id,job_type):
        params = {'auth_token': self.api_token}


        url = "".join([self.base_url, '/user/', self.api_user_id, '/jobs/',str(job_id),'/',job_type])
        print(url)
        print(params)
        request = requests.get(url, params=params)
        if request.status_code == 200:
            request.encoding = 'utf-8'


            return request.json()
        else:
            err_msg = ("Attempt to GET job details failed with code {}\n").format(request.status_code)
            return err_msg


def transcribe(filePath,outputPath):
    base_url = 'https://api.speechmatics.com/v1.0'
    api_user_id = '63847'
    api_token = 'NGE4ZjgxYWMtZjYyNy00YmExLWFkZGQtMWJkZjNjZjA2MWE4'
    video_File = "/Users/jeff/PycharmProjects/AnnotateFiles/Video_Files/04_jeffersons-great-contribution.mp4"
    language = 'en-US'
    client= SpeechmaticsClient(api_user_id,api_token,base_url)
    #filePath= "/Users/jeff/PycharmProjects/AnnotateFiles/Video_Files/zero.wav"
    base = os.path.basename(filePath)
    myFileName, myFileExt = os.path.splitext(base)

    logging.basicConfig(level=logging.INFO)

    #job_id = '11734332'
    job_id = client.job_post(filePath,language)
    logging.info("Your job has started with ID {}".format(job_id))
    details = client.job_details(job_id)

    print(details)

    while details[u'job_status'] not in ['done', 'expired', 'unsupported_file_format', 'could_not_align']:
        logging.info("Waiting for job to be processed. Will check again in {} seconds".format(details['check_wait']))
        wait_s=details['check_wait']
        time.sleep(wait_s)
        details = client.job_details(job_id)

    if details['job_status'] == 'unsupported_file_format':
        raise SpeechmaticsError("File was in an unsupported file format and could not be transcribed. "
                                "You have been reimbursed all credits for this job.")

    if details['job_status'] == 'could_not_align':
        raise SpeechmaticsError("Could not align text and audio file. "
                                "You have been reimbursed all credits for this job.")

    logging.info("Processing complete, getting ouput")
    if details['job_type'] == 'transcription':
        job_type = 'transcript'
    #job_id = 13719397
    output = client.get_output(job_id,job_type)
    outputjson = client.get_jsonOutput(job_id,job_type)
    print(output)
    print(outputjson)
    textFileName =str(outputPath+myFileName+'.txt')
    print(textFileName)
    timeStampJson = str(outputPath+myFileName+'.json')
    print(timeStampJson)
    file = open(textFileName,'w')
    file.write(output)
    file.close()
    with open(timeStampJson, 'w') as f:
        json.dump(outputjson, f)
    return textFileName,timeStampJson



if __name__ == '__main__':
    transcribe()