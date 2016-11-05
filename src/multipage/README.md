# Mailbox with news
The aim of this example to develop interface of the lib to be used to solve
some common problems in web development.

# Features

1. Multiple pages with subpages
  - News page just to show recent posts from Reddit: https://www.reddit.com/r/todayilearned/top.json?limit=100
  - Mail page to show two kind of subpages: inbox mails and sent mails.
    - Inbox may have multiple "boxes", each box is a subreddit from https://www.reddit.com/reddits.json. In each box (subreddit) list of posts should be showed
    - Sent should contain just the same list posts from news.
2. User login/logout, that may affect active page and all subpages.
  - If user logged in, user may be able to remove some mail from inbox.
  - Also user's name showed in navigation or sign in button otherwise.
3. Navigation header with active page highlighting
