# Peeker API
_Peeker_ is my version of `google keep` built with react and nodejs. It is fast, works offline, has reminder feature and supports image upload. Oh, it even allows you to login with facebook!


## Repo Information
- This is a `nodejs` project, so you have to have node installed
- `babel` handles the transpilation for this project
- `agenda` is used to set cron-job for in-app reminders
- `mongodb` is the employed database and `mongoose` is the db driver
- `jsonwebtoken` is used to handle authentication
- The project runs on an express server ([link to frontend repo](https://github.com/Confidence-Okoghenun/Peeker))

## Build And Deploy
This is a `nodejs` backend so make sure you have node installed
```
$ yarn install #installs all project dependencies

$ yarn dev #starts off local dev server on port 3000

$ yarn build #transpiles project and outputs to /dist

$ yarn start #starts off server form the /dist folder
```

Connect the project to your hosting provider (i.e `heroku`) and they will handle the deploy process for you

## Project Road Map
This is the roadmap of the project for the foreseeable future:
- [x] Release first stable version
- [x] Implement push notification with `web-push`
- [x] Implement in-app reminder with `agenda`
- [x] Support image upload