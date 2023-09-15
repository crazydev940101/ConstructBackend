import { config } from "../config/config"

export const generateJiraDomain = () => `https://${config.jiraProjectName}.atlassian.net`;

export const generateIssueEndpoint = () => `${generateJiraDomain()}/rest/api/3/issue`

export const generateBasicTokenFromAtlassianApiToken = () => `Basic ${Buffer.from(`vincent@hypervine.io:${config.atlassianApiKey}`).toString('base64')
    }`
