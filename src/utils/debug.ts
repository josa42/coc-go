import { Document, workspace } from 'coc.nvim';
import { TextDocument } from 'vscode-languageserver-protocol';
import { isTest } from './tests';

export const findNearestTest = async (): Promise<string | undefined> => {
  const doc = await workspace.document;
  const { nvim } = workspace;
  const lineNumber = ((await nvim.call('line', '.')) as number) - 1;

  return findTestName(doc, lineNumber);
};

const findTestName = (doc: Document, lineNumber: number) => {
  if (lineNumber < 0) {
    return undefined;
  }

  const testName = extractTestNameFromLine(doc.getline(lineNumber) ?? '');
  if (testName) {
    return testName;
  }

  return findTestName(doc, lineNumber - 1);
};

const extractTestNameFromLine = (line: string) => {
  const matchedArray = line.match(/^\s*func\s*(Test[^(]+)/);
  if (matchedArray != undefined) {
    return matchedArray[1].trimEnd();
  }
  return undefined;
};

////////////////////////////////////////////////////////////////////////////////

export async function debugNearestTest(document: TextDocument): Promise<void> {
  if (!isTest(document)) {
    workspace.showMessage('Document is not a test file', 'error');
    return;
  }

  const name = workspace
    .getConfiguration('go.debug.vimspector.configuration')
    .get<string>('name');
  const testIdentifier = await findNearestTest();

  if (testIdentifier) {
    console.info(`debuging test: ${testIdentifier}`);
    const configuration = {
      configuration: name,
      TestIdentifier: testIdentifier,
    };
    await workspace.nvim.call('vimspector#LaunchWithSettings', configuration);
  }
}
