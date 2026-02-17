// Mock VS Code API for testing
export const window = {
  showInformationMessage: jest.fn(),
  showWarningMessage: jest.fn(),
  createStatusBarItem: jest.fn(() => ({
    text: '',
    show: jest.fn(),
    hide: jest.fn(),
    dispose: jest.fn(),
    command: '',
    tooltip: '',
    name: ''
  }))
};

export const workspace = {
  getConfiguration: jest.fn(() => ({
    get: jest.fn(),
    update: jest.fn()
  })),
  workspaceFolders: undefined
};

export const commands = {
  registerCommand: jest.fn(),
  executeCommand: jest.fn()
};

export const StatusBarAlignment = {
  Left: 1,
  Right: 2
};

export const ThemeIcon = jest.fn();

export const chat = {
  createChatParticipant: jest.fn()
};

export const RelativePattern = jest.fn();

export const Uri = {
  file: jest.fn(),
  parse: jest.fn()
};

export const ProgressLocation = {
  Notification: 1
};

export const ConfigurationTarget = {
  Global: 1,
  Workspace: 2,
  WorkspaceFolder: 3
};
