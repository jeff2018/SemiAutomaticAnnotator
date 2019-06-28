import pdftotext
import pytesseract
import pdf2image
import tempfile
import os
from PIL import Image
from .models import *

def processPDF(pdfFile):

    ocrTextExraction(pdfFile)


    return None

def ocrTextExraction(f):



    print(f.name)


    tempTextDir = tempfile.TemporaryDirectory
    page_counter = 0
    filepages = PageAnnotation.objects.filter(pdf_id=f.id)
    print(filepages,len(filepages))
    if len(filepages) == 0:
        path = f.filepath
        folder = "/Users/jeff/PycharmProjects/SAAnnotator/upload/texts_" + str(f.id) + "/"
        if not os.path.exists(folder):
            os.makedirs(folder)

            print("Converting PDF to image...")
            print("path: " + str(path))
            pages = pdf2image.convert_from_path(path, 500)
            print(len(pages))

            tempImageDir = tempfile.TemporaryDirectory
            print("Temp directory after change:", tempfile.gettempdir())

            for page in pages:
                page_counter = page_counter + 1

                imageFilename = str(tempImageDir) +"page_" + str(page_counter) + ".jpg"
                page.save(imageFilename,'JPEG')

                textFileName = str(folder) +"text_page_" + str(page_counter) +"_"+str(f.id)+ ".txt"
                if not os.path.exists(textFileName):
                    tf = open(textFileName,'w')
                    text= str(((pytesseract.image_to_string(Image.open(imageFilename)))))
                    print("text",text)
                    tf.write(text)
                    tf.close()



            f.nbrOfPages = page_counter
            f.textfolder= folder
            f.save()



    return None