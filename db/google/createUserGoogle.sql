insert into users (username, googleid) values ($1, $2) returning username, userid;
