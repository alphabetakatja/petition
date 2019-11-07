DROP TABLE IF EXISTS signatures

CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    signature TEXT NOT NULL CHECK (signature != ''),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INSERT INTO signatures (id, first_name, last_name, signature) VALUES (111111, 'test', 'test', 'test', 13617445);
