package providers;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.eclipse.jdt.core.dom.AST;
import org.eclipse.jdt.core.dom.ASTNode;
import org.eclipse.jdt.core.dom.ASTParser;
import org.eclipse.jdt.core.dom.CompilationUnit;
import org.eclipse.jdt.core.dom.StructuralPropertyDescriptor;

/**
 * A {@link AbstractContentProvider<ASTNode>} extension for java AST content
 * providers. This boundary class communicates with {@link IOException},
 * {@link BufferedReader}, {@link FileReader}, and other 6 classes.
 * <p>
 * It allows:
 * <ul>
 * <li>extracting file content;</li>
 * <li>getting node children; and</li>
 * <li>parsing java AST content provider.</li>
 * </ul>
 */
public class JavaASTContentProvider extends AbstractContentProvider<ASTNode> {

	String filePath;
	String fileContent;

	public JavaASTContentProvider(String filePath) {
		this.filePath = filePath;

		setTreeObject(createASTTree());
		this.fileContent = "";
	}

	// extracts file content into string
	public String extractFileContent(String filepath) throws IOException {
		//System.out.println("Converting: \n" + filepath);

		BufferedReader reader = new BufferedReader(new FileReader(filepath));
		final StringBuffer buffer = new StringBuffer();
		String line = null;

		while (null != (line = reader.readLine())) {
			buffer.append(line).append("\n");
		}
		reader.close();
		return buffer.toString();
	}

	@Override
	public List<ASTNode> getNodeChildren(ASTNode node) {
		
		List<StructuralPropertyDescriptor> list = node.structuralPropertiesForType();

		List<ASTNode> children = new ArrayList<>();

		for (StructuralPropertyDescriptor descriptor : list) {
			Object child = node.getStructuralProperty(descriptor);

			if (child instanceof List) {
				children.addAll((List<ASTNode>) child);
			} else if (child instanceof ASTNode) {
				children.add((ASTNode) child);
				
			}
		}
		//System.out.println(children);
		return children;
	}

	@Override
	protected CompilationUnit parse() {
		try {
			fileContent = extractFileContent(filePath);
		} catch (Exception e) {
			// TODO: handle exception
			System.out.println("Error while extracting file content: " + e);
		}

		ASTParser parser = ASTParser.newParser(AST.JLS8);
		parser.setKind(ASTParser.K_COMPILATION_UNIT);
		parser.setSource(fileContent.toCharArray());
		parser.setResolveBindings(true);

		return (CompilationUnit) parser.createAST(null);
	}
	
	@Override
	public int getNodeOffset(ASTNode node) {
		return node.getStartPosition();
	}

}
