package providers;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.eclipse.cdt.core.dom.ast.IASTNode;
import org.eclipse.cdt.core.dom.ast.IASTPreprocessorStatement;
import org.eclipse.cdt.core.dom.ast.IASTTranslationUnit;
import org.eclipse.cdt.core.dom.ast.gnu.cpp.GPPLanguage;
import org.eclipse.cdt.core.parser.DefaultLogService;
import org.eclipse.cdt.core.parser.FileContent;
import org.eclipse.cdt.core.parser.IParserLogService;
import org.eclipse.cdt.core.parser.IScannerInfo;
import org.eclipse.cdt.core.parser.IncludeFileContentProvider;
import org.eclipse.cdt.core.parser.ScannerInfo;

import org.eclipse.core.runtime.CoreException;

/**
 * A {@link AbstractContentProvider<IASTNode>} extension for cAST content
 * providers. This boundary class communicates with {@link IASTNode},
 * {@link FileContent}, {@link Map}, and other 10 classes.
 * <p>
 * It allows:
 * <ul>
 * <li>parsing cAST content provider; and</li>
 * <li>getting node children.</li>
 * </ul>
 */
public class CASTContentProvider extends AbstractContentProvider<IASTNode> {

	String filepath;

	public CASTContentProvider(String filepath) {

		this.filepath = filepath;
		setTreeObject(createASTTree());
	}

	@Override
	protected IASTNode parse() {

		/*
		 * IWorkspace iWorkspace = ResourcesPlugin.getWorkspace();
		 * System.out.println(iWorkspace); IProject iProject =
		 * iWorkspace.getRoot().getProject("tempProject");
		 * 
		 * IProjectDescription iDescription =
		 * iWorkspace.newProjectDescription(iProject.getName());
		 */
		// iDescription.setLocationURI(location);

		// IPath iFilePath = new Path(filepath);
		// IFile iFile = ResourcesPlugin.getWorkspace().getRoot().getFile(iFilePath);
		FileContent content = FileContent.createForExternalFileLocation(filepath);
		// File cFile = new File(filepath);
		Map definedSymbols = new HashMap();
		String[] includePaths = new String[0];
		IScannerInfo info = new ScannerInfo(definedSymbols, includePaths);
		IParserLogService log = new DefaultLogService();

		IncludeFileContentProvider emptyIncludes = IncludeFileContentProvider.getEmptyFilesProvider();
		int opts = 8;

		try {
			IASTTranslationUnit translationUnit = GPPLanguage.getDefault().getASTTranslationUnit(content, info,
					emptyIncludes, null, opts, log);
			return translationUnit;
		} catch (CoreException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}

		// String name = new FileDialog(aShell, SWT.OPEN).open();
		// String editorID = "org.eclipse.ui.DefaultTextEditor";
		// IWorkbenchPage iPage =
		// PlatformUI.getWorkbench().getActiveWorkbenchWindow().getActivePage();
		// System.out.println("Try Catch incoming");
		/*
		 * try { IEditorPart editorPart = IDE.openEditor(iPage, new
		 * StringEditorInput(new StringStorage(inputString)) { },editorID); } catch
		 * (Exception e) { // TODO: handle exception }
		 */

		// IEditorInput input = edi
		// ITranslationUnit input = (ITranslationUnit)
		// CoreModelUtil.findTranslationUnit(iFile);//
		// inputString;//((ITranslationUnitHolder)

		// ITranslationUnit input = new TranslationUnit(parent, filepath, idType)
		// inputString; // inputString);//.getTranslationUnit();
		/*
		 * try { // IEditorPart editorpart = ((IEditorpart)inputString);
		 * 
		 * IASTTranslationUnit translationUnit = input.getAST();
		 * 
		 * return translationUnit; } catch (CoreException e) {
		 * 
		 * }
		 */
		return null;
	}

	@Override
	public List<IASTNode> getNodeChildren(IASTNode node) {
		List<IASTNode> children = new ArrayList<>();

		if (node instanceof IASTTranslationUnit) {
			for (IASTPreprocessorStatement preprocessorStatement : ((IASTTranslationUnit) node)
					.getAllPreprocessorStatements()) {

				if (preprocessorStatement.isPartOfTranslationUnitFile()) {
					children.add(preprocessorStatement);
				}
			}
		}
		for (IASTNode child : node.getChildren()) {
			if (child.isPartOfTranslationUnitFile()) {
				children.add(child);
				// children.addAll(getCommentsUnderNode(child));
			}
		}
		return children;
	}

	@Override
	public int getNodeOffset(IASTNode node) {
		// TODO Auto-generated method stub
		return 0;
	}

}
