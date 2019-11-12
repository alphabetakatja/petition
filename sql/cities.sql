CREATE TABLE cities (
    id SERIAL primary key,
    city VARCHAR(255) NOT NULL,
    state VARCHAR(255),
    population INT,
    country VARCHAR
);

INSERT INTO cities (city, country, population) VALUES ('Berlin', 'Germany', 3610156);
INSERT INTO cities (city, country, population) VALUES ('Hamburg', 'Germany', 1774242);
INSERT INTO cities (city, country, population) VALUES ('Munch', 'Germany', 1450381);
INSERT INTO cities (city, country, population) VALUES ('Tokyo', 'Japan', 13617445);
INSERT INTO cities (city, country, population) VALUES ('Sydney', 'Australia', 4921000);

-- you wanna check if the str.startsWtih('http://' || 'https://');
-- if it doesn't add the ('http://') -
-- req.body.url = "mywebsite.com" - check is it startsWith it and do http:// plus the website;

--  joins SELECT * FROM singers
--  JOIN songs
-- ON singers.id = songs.singer_id

-- update jquery
-- SELECT singers.id AS `singerId`,
-- singers.name AS singer_name,
-- songs.name AS song_name
-- FROM singers JOIN songs
-- ON singers.id = songs.singer_id
-- WHERE singers.id = 2;

-- when you join tables you can do INNER JOIN (includes only the things in common) and
-- FULL OUTER JOIN (to include also the things that are not in common to both tables)

-- LEFT OUTER JOIN

-- TRIPLE JOINTS
-- in /signers route we do the triple join

-- new GET and POST ROUTE for profiles page;
-- send information of the user to the user_profiles table;

-- update signers page - it will need a triple join and conditionals in handlebars:
-- {{#signers}}
-- {{#if url}}
-- take the name and wrap it in the a tag
-- <a href="{{url}}">{{firstName}} {{lastName}} </a>
-- {{else}}
-- just show the name
-- {{firstName}} {{lastName}}
-- {{/signers}}

-- CAPITALIZATION OF WORDS VS NON CAPITALIZATION
-- berlin, BERLIN, Berlin (compare like in incremental search)
-- SQL QUERY:
-- WHERE city = $1
-- becomes =>
-- WHERE LOWER (city) = LOWER($1);

-- req.params.cityName
-- we lower case all the city params the user types in
