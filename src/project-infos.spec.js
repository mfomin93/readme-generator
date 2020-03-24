const ora = require('ora')
const childProcess = require('child_process')

const utils = require('./utils')
const { getProjectInfos } = require('./project-infos')

jest.mock('ora')
jest.mock('child_process', () => ({
  execSync: jest.fn()
}))
jest.mock('./utils', () => ({
  getPackageJson: jest.fn(),
  getProjectName: jest.fn(() => 'readme-md-generator'),
  getAuthorWebsiteFromGithubAPI: jest.fn(
    () => 'https://mfomin93.github.io/portfolio/'
  ),
  getPackageManagerFromLockFile: jest.fn(() => 'yarn')
}))

const succeed = jest.fn()
const fail = jest.fn()

ora.mockReturnValue({
  start: () => ({
    succeed,
    fail
  })
})

describe('projectInfos', () => {
  describe('getProjectInfos', () => {
    it('should call ora with correct parameters', async () => {
      await getProjectInfos()

      expect(ora).toHaveBeenCalledTimes(1)
      expect(ora).toHaveBeenCalledWith('Gathering project infos')
      expect(succeed).toHaveBeenCalledTimes(1)
      expect(succeed).toHaveBeenCalledWith('Project infos gathered')
    })

    it('should return correct infos', async () => {
      const packgeJsonInfos = {
        name: 'readme-md-generator',
        version: '0.1.3',
        description: 'CLI that generates README.md files.',
        author: 'Mark Fomin',
        homepage: 'https://github.com/mfomin93/readme-generator',
        repository: {
          type: 'git',
          url: 'git+https://github.com/mfomin93/readme-generator.git'
        },
        engines: {
          npm: '>=5.5.0',
          node: '>=9.3.0'
        }
      }
      utils.getPackageJson.mockReturnValueOnce(Promise.resolve(packgeJsonInfos))
      childProcess.execSync.mockReturnValue(
        'https://github.com/mfomin93/readme-generator.git'
      )

      const projectInfos = await getProjectInfos()

      expect(projectInfos).toEqual({
        name: 'readme-md-generator',
        description: 'CLI that generates README.md files.',
        version: '0.1.3',
        author: 'Mark Fomin',
        repositoryUrl: 'https://github.com/mfomin93/readme-generator',
        homepage: 'https://github.com/mfomin93/readme-generator',

        authorWebsite: 'https://mfomin93.github.io/portfolio/',
        githubUsername: 'mfomin93',
        engines: {
          npm: '>=5.5.0',
          node: '>=9.3.0'
        },

        documentationUrl:
          'https://github.com/mfomin93/readme-generator#readme',
        isGithubRepos: true,
        isJSProject: true,

        hasStartCommand: false,
        hasTestCommand: false,
        packageManager: 'yarn'
      })
    })

    it('should return correct infos when repos is not github', async () => {
      const packgeJsonInfos = {
        name: 'readme-md-generator',
        version: '0.1.3',
        description: 'CLI that generates README.md files.',
        author: 'Mark Fomin',
        license: 'MIT',
        homepage: 'https://github.com/mfomin93/readme-generator',
        repository: {
          type: 'git',
          url: 'git+https://github.com/mfomin93/readme-generator.git'
        },
        engines: {
          npm: '>=5.5.0',
          node: '>=9.3.0'
        }
      }
      utils.getPackageJson.mockReturnValueOnce(Promise.resolve(packgeJsonInfos))
      childProcess.execSync.mockReturnValue(
        'https://github.com/mfomin93/readme-generator.git'
      )

      const projectInfos = await getProjectInfos()

      expect(projectInfos).toEqual({
        name: 'readme-md-generator',
        description: 'CLI that generates README.md files.',
        version: '0.1.3',
        author: 'Mark Fomin',
        repositoryUrl: 'https://github.com/mfomin93/readme-generator',

        homepage: 'https://github.com/mfomin93/readme-generator',
        githubUsername: undefined,
        authorWebsite: undefined,
        engines: {
          npm: '>=5.5.0',
          node: '>=9.3.0'
        },

        licenseUrl: undefined,
        documentationUrl: undefined,
        isGithubRepos: false,
        isJSProject: true,

        hasStartCommand: false,
        hasTestCommand: false,
        packageManager: 'yarn'
      })
    })

    it('should return correct infos when package.json is not defined', async () => {
      utils.getPackageJson.mockReturnValueOnce(Promise.resolve(undefined))
      childProcess.execSync.mockReturnValue(
        'https://github.com/mfomin93/readme-generator.git'
      )

      const projectInfos = await getProjectInfos()

      expect(projectInfos).toEqual({
        name: 'readme-md-generator',
        description: undefined,
        version: undefined,
        author: undefined,
        repositoryUrl: 'https://github.com/mfomin93/readme-generator',

        homepage: undefined,
        githubUsername: 'mfomin93',
        authorWebsite: 'https://mfomin93.github.io/portfolio/',
        engines: undefined,
        licenseName: undefined,

        documentationUrl:
          'https://github.com/mfomin93/readme-generator#readme',
        isGithubRepos: true,
        isJSProject: false,

        hasStartCommand: false,
        hasTestCommand: false
      })
    })

    it('should return correct infos when repos is not github and package.json are not defined', async () => {
      utils.getPackageJson.mockReturnValueOnce(Promise.resolve(undefined))
      childProcess.execSync.mockReturnValue(
        'https://github.com/mfomin93/readme-generator.git'
      )

      const projectInfos = await getProjectInfos()

      expect(projectInfos).toEqual({
        name: 'readme-md-generator',
        description: undefined,
        version: undefined,
        author: undefined,
        repositoryUrl: 'https://github.com/mfomin93/readme-generator',
        authorWebsite: undefined,

        homepage: undefined,
        githubUsername: undefined,
        engines: undefined,
        licenseName: undefined,
        licenseUrl: undefined,
        documentationUrl: undefined,
        isGithubRepos: false,
        isJSProject: false,

        hasStartCommand: false,
        hasTestCommand: false
      })
    })

    it('should return correct infos when git config and package.json are not defined', async () => {
      utils.getPackageJson.mockReturnValueOnce(Promise.resolve(undefined))
      childProcess.execSync.mockImplementation(() => {
        throw new Error('error')
      })

      const projectInfos = await getProjectInfos()

      expect(projectInfos).toEqual({
        name: 'readme-md-generator',
        description: undefined,
        version: undefined,
        author: undefined,
        repositoryUrl: undefined,
        contributingUrl: undefined,
        homepage: undefined,
        authorWebsite: undefined,
        githubUsername: undefined,
        engines: undefined,
        licenseName: undefined,
        licenseUrl: undefined,
        documentationUrl: undefined,
        isGithubRepos: false,
        isJSProject: false,
        testCommand: undefined,
        hasStartCommand: false,
        hasTestCommand: false
      })
    })

    it('should return correct infos when git config is not defined', async () => {
      const packgeJsonInfos = {
        name: 'readme-md-generator',
        version: '0.1.3',
        description: 'CLI that generates README.md files.',
        author: 'Mark Fomin',
        license: 'MIT',
        homepage: 'https://github.com/mfomin93/readme-generator',
        repository: {
          type: 'git',
          url: 'git+https://github.com/mfomin93/readme-generator.git'
        },
        engines: {
          npm: '>=5.5.0',
          node: '>=9.3.0'
        }
      }
      utils.getPackageJson.mockReturnValueOnce(Promise.resolve(packgeJsonInfos))
      childProcess.execSync.mockImplementation(() => {
        throw new Error('error')
      })

      const projectInfos = await getProjectInfos()

      expect(projectInfos).toEqual({
        name: 'readme-md-generator',
        description: 'CLI that generates README.md files.',
        version: '0.1.3',
        author: 'Mark Fomin',
        repositoryUrl: 'https://github.com/mfomin93/readme-generator',

        homepage: 'https://github.com/mfomin93/readme-generator',
        githubUsername: 'mfomin93',
        authorWebsite: 'https://mfomin93.github.io/portfolio/',
        engines: {
          npm: '>=5.5.0',
          node: '>=9.3.0'
        },


        documentationUrl:
          'https://github.com/mfomin93/readme-generator#readme',
        isGithubRepos: true,
        isJSProject: true,

        hasStartCommand: false,
        hasTestCommand: false,
        packageManager: 'yarn'
      })
    })

    it('should return correct infos when author is defined as an object', async () => {
      const packgeJsonInfos = {
        name: 'readme-md-generator',
        version: '0.1.3',
        description: 'CLI that generates README.md files.',
        author: {
          name: 'Mark Fomin',
          email: 'mfomin93@gmail.com',
          url: ''
        },
        license: 'MIT',
        homepage: 'https://github.com/mfomin93/readme-generator',
        repository: {
          type: 'git',
          url: 'git+https://github.com/mfomin93/readme-generator.git'
        },
        engines: {
          npm: '>=5.5.0',
          node: '>=9.3.0'
        }
      }
      utils.getPackageJson.mockReturnValueOnce(Promise.resolve(packgeJsonInfos))
      childProcess.execSync.mockReturnValue(
        'https://github.com/mfomin93/readme-generator.git'
      )

      const projectInfos = await getProjectInfos()

      expect(projectInfos).toEqual({
        name: 'readme-md-generator',
        description: 'CLI that generates README.md files.',
        version: '0.1.3',
        author: 'Mark Fomin',
        repositoryUrl: 'https://github.com/mfomin93/readme-generator',
        homepage: 'https://github.com/mfomin93/readme-generator',

        githubUsername: 'mfomin93',
        authorWebsite: 'https://mfomin93.github.io/portfolio/',
        engines: {
          npm: '>=5.5.0',
          node: '>=9.3.0'
        },

        documentationUrl:
          'https://github.com/mfomin93/readme-generator#readme',
        isGithubRepos: true,
        isJSProject: true,

        hasStartCommand: false,
        hasTestCommand: false,
        packageManager: 'yarn'
      })
    })

    it('should return correct infos when lock file is found', async () => {
      const packgeJsonInfos = {
        name: 'readme-md-generator',
        version: '0.1.3',
        description: 'CLI that generates README.md files.',
        author: 'Mark Fomin',
        license: 'MIT',
        homepage: 'https://github.com/mfomin93/readme-generator',
        repository: {
          type: 'git',
          url: 'git+https://github.com/mfomin93/readme-generator.git'
        },
        engines: {
          npm: '>=5.5.0',
          node: '>=9.3.0'
        },
        scripts: {
          start: 'node src/index.js',
          test: 'jest'
        }
      }
      utils.getPackageJson.mockReturnValueOnce(Promise.resolve(packgeJsonInfos))
      utils.getPackageManagerFromLockFile.mockReturnValueOnce('yarn')
      childProcess.execSync.mockReturnValue(
        'https://github.com/mfomin93/readme-generator.git'
      )

      const projectInfos = await getProjectInfos()

      expect(projectInfos).toEqual({
        name: 'readme-md-generator',
        description: 'CLI that generates README.md files.',
        version: '0.1.3',
        author: 'Mark Fomin',
        repositoryUrl: 'https://github.com/mfomin93/readme-generator',
        homepage: 'https://github.com/mfomin93/readme-generator',
        authorWebsite: 'https://mfomin93.github.io/portfolio/',
        githubUsername: 'mfomin93',
        engines: {
          npm: '>=5.5.0',
          node: '>=9.3.0'
        },


        documentationUrl:
          'https://github.com/mfomin93/readme-generator#readme',
        isGithubRepos: true,
        isJSProject: true,
        hasStartCommand: true,
        hasTestCommand: true,
        packageManager: 'yarn'
      })
    })
  })
})
