const fetch = require('node-fetch')
const askAuthorWebsite = require('./author-website')

jest.mock('node-fetch')

describe('askAuthorWebsite', () => {
  it('should return correct question format', () => {
    const authorWebsite = 'authorWebsite'
    const projectInfos = { authorWebsite }

    const result = askAuthorWebsite(projectInfos)

    expect(result).toEqual(
      expect.objectContaining({
        type: 'input',
        message: ' Author website (use empty value to skip)',
        name: 'authorWebsite'
      })
    )
  })

  it('should return a new website url if user changes its github username with the previous question', async () => {
    const blog = 'https://www.new-website-url.com/'
    const projectInfos = {
      githubUsername: 'mfomin93',
      authorWebsite: 'https://mfomin93.github.io/portfolio/'
    }

    fetch.mockReturnValueOnce(
      Promise.resolve({
        json: () => Promise.resolve({ blog })
      })
    )

    const result = await askAuthorWebsite(projectInfos).default({
      authorGithubUsername: 'newGitHubUsername'
    })

    expect(result).toEqual(blog)
  })

  it('should return project infos website url if github username did not change', async () => {
    const projectInfos = {
      githubUsername: 'mfomin93',
      authorWebsite: 'https://mfomin93.github.io/portfolio/'
    }

    const result = await askAuthorWebsite(projectInfos).default({
      authorGithubUsername: 'mfomin93'
    })

    expect(result).toEqual(projectInfos.authorWebsite)
  })
})
