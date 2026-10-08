# Study Sprint Board

A small study task board built with Vite (vanilla JavaScript) and Tailwind CSS.
Tasks live in three columns (To Do, In Progress, Done).

## Features

- Add tasks with title, subject and priority (with input validation)
- Move tasks between columns, edit and delete them
- Search by title or subject and filter by priority (they work together)
- Progress dashboard: total, per-status counts and completion percentage
- Data is saved in the browser with localStorage
- Reset Board button restores the starter tasks

## Setup

```
npm install
npm run dev
npm run build
```

## Where data is saved

Tasks are stored in the browser's localStorage under the key `task4-study-board`.

## Limitations

- Data stays in one browser on one device (no backend or sync)
- No drag and drop (status is changed with a select)