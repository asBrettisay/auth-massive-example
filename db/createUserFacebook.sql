insert into users (username, facebookid) values ($1, $2) returning username, userid;
