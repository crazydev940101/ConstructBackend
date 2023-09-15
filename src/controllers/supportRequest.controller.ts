import fetch, { Response } from 'node-fetch';
import { generateBasicTokenFromAtlassianApiToken, generateIssueEndpoint } from "../services/jira"
import { ERequestMethods, IIssue } from "../interfaces"

/**
 {
    "fields": {
        "assignee": {
        "id": "5b109f2e9729b51b54dc274d"
        },
        "components": [
        {
            "id": "10000"
        }
        ],
        "customfield_10000": "09/Jun/19",
        "customfield_20000": "06/Jul/19 3:25 PM",
        "customfield_30000": [
        "10000",
        "10002"
        ],
        "customfield_40000": {
        "content": [
            {
            "content": [
                {
                "text": "Occurs on all orders",
                "type": "text"
                }
            ],
            "type": "paragraph"
            }
        ],
        "type": "doc",
        "version": 1
        },
        "customfield_50000": {
        "content": [
            {
            "content": [
                {
                "text": "Could impact day-to-day work.",
                "type": "text"
                }
            ],
            "type": "paragraph"
            }
        ],
        "type": "doc",
        "version": 1
        },
        "customfield_60000": "jira-software-users",
        "customfield_70000": [
        "jira-administrators",
        "jira-software-users"
        ],
        "customfield_80000": {
        "value": "red"
        },
        "description": {
        "content": [
            {
            "content": [
                {
                "text": "Order entry fails when selecting supplier.",
                "type": "text"
                }
            ],
            "type": "paragraph"
            }
        ],
        "type": "doc",
        "version": 1
        },
        "duedate": "2019-05-11",
        "environment": {
        "content": [
            {
            "content": [
                {
                "text": "UAT",
                "type": "text"
                }
            ],
            "type": "paragraph"
            }
        ],
        "type": "doc",
        "version": 1
        },
        "fixVersions": [
        {
            "id": "10001"
        }
        ],
        "issuetype": {
        "id": "10000"
        },
        "labels": [
        "bugfix",
        "blitz_test"
        ],
        "parent": {
        "key": "PROJ-123"
        },
        "priority": {
        "id": "20000"
        },
        "project": {
        "id": "10000"
        },
        "reporter": {
        "id": "5b10a2844c20165700ede21g"
        },
        "security": {
        "id": "10000"
        },
        "summary": "Main order flow broken",
        "timetracking": {
        "originalEstimate": "10",
        "remainingEstimate": "5"
        },
        "versions": [
        {
            "id": "10000"
        }
        ]
    },
    "update": {}
    }
*/
export const addNewIssue = async (issue: IIssue): Promise<Response> => {
  let bodyData = `{
        "fields": {
          "description": {
            "content": [`;
  bodyData += issue.description.includes('\n') ? issue.description.split('\n').map(desc => {
    if (desc) {
      return `
                  {
                    "content": [
                      {
                        "text": "${desc}",
                        "type": "text"
                      }
                    ],
                    "type": "paragraph"
                  },`
    } else {
      return `
                  {
                    "content": [],
                    "type": "paragraph"
                  },`
    }
  }).join('') : `
              {
                "content": [
                  {
                    "text": "${issue.description}",
                    "type": "text"
                  }
                ],
                "type": "paragraph"
              },`
  bodyData += `
              {
                "content": [],
                "type": "paragraph"
              },
              {
                "content": [
                  {
                    "text": "Reporter",
                    "type": "text",
                    "marks": [
                      {
                        "type": "strong"
                      }
                    ]
                  }
                ],
                "type": "paragraph"
              },
              {
                "content": [
                  {
                    "text": "Name: ${issue.name}",
                    "type": "text"
                  }
                ],
                "type": "paragraph"
              },
              {
                "content": [
                  {
                    "text": "Email: ${issue.email}",
                    "type": "text"
                  }
                ],
                "type": "paragraph"
              },
              {
                "content": [
                  {
                    "text": "Company Name: ${issue.company}",
                    "type": "text"
                  }
                ],
                "type": "paragraph"
              },
              {
                "content": [
                  {
                    "text": "Request Type: ${issue.supportType}",
                    "type": "text"
                  }
                ],
                "type": "paragraph"
              }
            ],
            "type": "doc",
            "version": 1
          },
          "labels": [
            "SUPPORT_REQUEST"
          ],
          "issuetype": {
            "id": "10021"
            },
          "project": {
            "key": "APS1"
            },
          "summary": "${issue.summary}"
        },
        "update": {}
      }`
  return new Promise((resolve, reject) => {
    fetch(
      generateIssueEndpoint(),
      {
        method: ERequestMethods.POST,
        headers: {
          'Authorization': generateBasicTokenFromAtlassianApiToken(),
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: bodyData
      }
    )
      .then(async (response) => {
        console.log(response)
        resolve(response)
      })
      .catch(err => {
        reject(err)
      });
  })
}