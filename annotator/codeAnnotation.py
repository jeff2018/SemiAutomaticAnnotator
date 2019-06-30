import subprocess
import os


pluginsPath = "/Applications/Eclipse.app/Contents/Eclipse/plugins/"

runtime = "org.eclipse.core.runtime_3.13.0.v20170207-1030.jar"
jdt_core = "org.eclipse.jdt.core_3.13.102.v20180330-0919.jar"
cdt_core = "org.eclipse.cdt.core_6.4.0.201802261533.jar"
resources = "org.eclipse.core.resources_3.12.0.v20170417-1558.jar"
contenttype = "org.eclipse.core.contenttype_3.6.0.v20170207-1037.jar"
emf_common = "org.eclipse.emf.common_2.13.0.v20170609-0707.jar"
equinox_common = "org.eclipse.equinox.common_3.9.0.v20170207-1454.jar"
equinox_pref = "org.eclipse.equinox.preferences_3.7.0.v20170126-2132.jar"
jobs = "org.eclipse.core.jobs_3.9.3.v20180115-1757.jar"
osgi = "org.eclipse.osgi_3.12.100.v20180210-1608.jar"
gson = "com.google.gson_2.7.0.v20170129-0911.jar"
apache_common ="org.apache.commons.io_2.2.0.v201405211200.jar"

treeobject = "Java_Files/AST_Test/src/model/TreeObject.java"
treeparent = "Java_Files/AST_Test/src/model/TreeParent.java"
acfm = "Java_Files/AST_Test/src/plugin/ALMAConceptMappingFactory.java"
acm = "Java_Files/AST_Test/src/plugin/ALMAConceptMapping.java"
plugin = "Java_Files/AST_Test/src/plugin/ALMAPluginActivator.java"
jacp = "Java_Files/AST_Test/src/views/JavaASTContentProvider.java"
cacp = "Java_Files/AST_Test/src/views/CASTContentProvider.java"
avcp = "Java_Files/AST_Test/src/views/AbstractViewContentProvider.java"
astcontroller = "Java_Files/AST_Test/src/ASTController/ASTController.java"

filepath = "/Users/jeff/PycharmProjects/AnnotateFiles/Java_Files/test123.c"



def compile_java(java_filepath):

    #try:
        subprocess.check_call(['javac','-cp',treeobject+":"+treeparent+":"+acfm+":"+acm+":"+plugin+":"+jacp+":"+cacp+":"+avcp+":"+astcontroller+":"+pluginsPath+cdt_core+":"+pluginsPath+jdt_core+":"+pluginsPath+gson+":"+pluginsPath+runtime+":"+pluginsPath+resources+":"+pluginsPath+contenttype+":"+pluginsPath+jobs+":"+pluginsPath+equinox_common+":"+pluginsPath+emf_common+":"+pluginsPath+equinox_pref+":"+pluginsPath+osgi+":"+pluginsPath+apache_common, java_filepath])
    #except subprocess.CalledProcessError as e:
     #   print(e)


def execute_java(java_filepath, args):

    classpath=os.path.dirname(java_filepath)
    base = os.path.basename(java_filepath)
    #print(base)
    java_class, ext = os.path.splitext(base)
    #print(java_class, ext)

    cmd = ['java', '-cp', classpath+":"+pluginsPath+cdt_core+":"+pluginsPath+jdt_core+":"+pluginsPath+gson+":"+pluginsPath+runtime+":"+pluginsPath+resources+":"+pluginsPath+contenttype+":"+pluginsPath+jobs+":"+pluginsPath+equinox_common+":"+pluginsPath+emf_common+":"+pluginsPath+equinox_pref+":"+pluginsPath+osgi+":"+pluginsPath+apache_common, java_class] + args

    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,universal_newlines=True).communicate()[0]
    return proc
    #print(proc.stdout.read())





args = []
args.append(filepath)

AnnotatorMain = 'Annotator_code/bin/Main.class'
#ASTTestmain = 'Java_Files/AST_Test/src/Main.java'
main = 'Java_Files/main.java'
parser ="Java_Files/Main.java"
#compile_java(ASTTestmain)
#execute_java(ASTTest,args)

