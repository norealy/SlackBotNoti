#Build a services pipeline with nodejs

##1. Intro Project

##2. File structure
```
.
├── common                 //code module
│   ├── BaseServer.js
│   └── utils              //Utility file storage of the common code
├── config                 //config file application environment variables
├── slack-google_calendar  //Pipeline of Slack and Google calendar
├── scripts                //Various scripts for starting the server
├── test                   //Unit test files
├── utils                  //Utility file storage of the application
├── .editorconfig
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

##3. How to start
###Slack - Google
Start from command line
- `cd slack-google; node index.js SLACK-GOOGLE ../config/`
- For `SLACK-GOOGLE` in the above example, enter the key name described in
 `config/SLACK-GOOGLE.json` of the bot body. The value corresponding to that key is
 used to start the server.

##4. Coding conventions
- Folder names written as lower-case
- File and class names written as UpperCamelCase
- Variable and function names written as camelCase
- Global variables and Constants written in UPPERCASE
- Limit your lines to 90 characters

##5. Rule Git
- All new features and fix bug must be develop on branch feature/{KEY_ISSUE}
 (Not dev on branch master, develop and stg). Eg: feature/NEOS_VN_BNT-0
- Before creating the feature branch, you must pull the latest code of the
 develop branch and create the feature branch on the latest code of the
 develop branch
- The commit message format is: {KEY_ISSUES} the content of the commit is about
 80 characters. Eg: NEOS_VN_BNT-0 project initialization
- Before creating pull request, you need to pull the code on the develop branch,
 if the develop branch has new code, you need merger in to the feature branch
 and fix the conflict to create a pull request.

##6. Rule pull request
###Content description of the pull request
* [ ] Folder names written as lower-case
* [ ] File and class names written as UpperCamelCase
* [ ] Variable and function names written as camelCase
* [ ] Global variables and Constants written in UPPERCASE
* [ ] Limit your lines to 90 characters
* [ ] The merge destination branch is correct (* Same as above)
* [ ] Check the feature branch deletion settings after merging ("Delete branch
 after merging" check)
*: In principle, the feature branch is deleted after merging.
* [ ] There are no undetermined specifications.
* [ ] There is no omission of registration of newly added files
* [ ] Does not contain irrelevant commits
* [ ] The title of the pull request should be easy to understand. Especially
 when there are multiple pull requests in one ticket, it is easy to distinguish
 them.
* [ ] Check the changes on the "File" tab of the created pull request.
* [ ] The description comment of the implementation unit (class/method/function
 /variable/table/column, etc.) is appropriate. If the position of the mounting
 unit is changed, the explanation comment should also be revised. Follow the
 official writing style jsdoc as much as possible.
