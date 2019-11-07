CREATE TABLE signatures (
    id SERIAL primary key,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    signature TEXT NOT NULL,
    created_at timestamp
);

INSERT INTO signatures (id, first_name, last_name, signature) VALUES (111111, 'test', 'test', 'test', 13617445);
