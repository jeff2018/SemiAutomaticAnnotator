import java.io.BufferedWriter;
import java.io.FileWriter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.apache.commons.io.FilenameUtils;
import org.eclipse.cdt.core.dom.ast.IASTNode;
import org.eclipse.jdt.core.dom.ASTNode;

import ASTController.ASTController;
import model.TreeObject;
import providers.CASTContentProvider;
import providers.JavaASTContentProvider;

public class Main<N> {

	public static void writeFileBufferedWritter(List<String> stringArray, String fileName, String fileNamePrefix,
			String fileBaseName, String nameSpace, String type) throws IOException {
		BufferedWriter writer = new BufferedWriter(new FileWriter("/Users/jeff/PycharmProjects/AnnotateFiles/"
				+ nameSpace + "/" + fileBaseName + "/" + type + "/" + fileNamePrefix + "_" + fileName + "_.txt"));
		for (String s : stringArray) {
			writer.write(s + "\n");
		}
		writer.close();
	}

	public static void main(String[] args) throws IOException {
		String filepath = args[0];
		
		if (filepath != null) {
			//System.out.println(filepath);
			List<String> conceptList = new ArrayList<String>();
			List<String> treeList = new ArrayList<String>();
			List<String> uriList = new ArrayList<>();
			List<String> mappingList = new ArrayList<>();
			List<String> combined = new ArrayList<>();
			String extension = FilenameUtils.getExtension(filepath);
			String fileName = FilenameUtils.getName(filepath);
			String fileBase = FilenameUtils.getBaseName(filepath);
			String namespace;
			if (extension.equals("java")) {
				namespace = extension;
				JavaASTContentProvider jacp = new JavaASTContentProvider(filepath);
				List<TreeObject<ASTNode>> astList = jacp.getTreeObject();
				ASTController<ASTNode> astController = new ASTController<ASTNode>();
				treeList = astController.treeList(astList.get(1), "");
				astList.remove(0);
				uriList = astController.renamedURIList(astList, namespace);
				mappingList = astController.mappingList(astList, uriList, namespace);
				conceptList = astController.conceptList(uriList);

			} else {
				namespace = "c";

				CASTContentProvider cacp = new CASTContentProvider(filepath);
				List<TreeObject<IASTNode>> astList = cacp.getTreeObject();

				ASTController<IASTNode> astController = new ASTController<IASTNode>();
				treeList = astController.treeList(astList.get(1), "");
				astList.remove(0);
				uriList = astController.renamedURIList(astList, namespace);
				mappingList = astController.mappingList(astList, uriList, namespace);
				conceptList = astController.conceptList(uriList);
			}
			combined.add("---Tree---");
			combined.addAll(treeList);
			combined.add("---Mapping---");
			combined.addAll(mappingList);
			//System.out.println(mappingList);
			for(int i = 0; i<mappingList.size();i++) {
				//System.out.println(mappingList.get(i));
				
			}
			writeFileBufferedWritter(combined, fileName, "Tree_and_Mapping", fileBase, extension, "text");
			writeFileBufferedWritter(conceptList, fileName, "Annotation", fileBase, extension, "annotations");
			for(int i = 0; i<conceptList.size();i++) {
				System.out.println(conceptList.get(i));
				
			}

		} else {
			System.out.println(filepath + " is not a valid path");
		}

	}
}
