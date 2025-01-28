-- PRAGMA defer_foreign_keys=TRUE;
-- CREATE TABLE d1_migrations(
-- 		id         INTEGER PRIMARY KEY AUTOINCREMENT,
-- 		name       TEXT UNIQUE,
-- 		applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
-- );
-- INSERT INTO d1_migrations VALUES(1,'0000_secret_pandemic.sql','2024-12-25 02:51:44');
-- INSERT INTO d1_migrations VALUES(2,'0001_cool_korvac.sql','2024-12-25 03:22:25');
-- INSERT INTO d1_migrations VALUES(3,'0000_amused_harpoon.sql','2024-12-25 04:02:43');
-- INSERT INTO d1_migrations VALUES(4,'0001_early_earthquake.sql','2024-12-25 04:02:43');
-- INSERT INTO d1_migrations VALUES(5,'0000_create_tables.sql','2024-12-25 16:51:12');
-- INSERT INTO d1_migrations VALUES(6,'0002_flimsy_lord_tyger.sql','2024-12-25 16:53:43');
-- INSERT INTO d1_migrations VALUES(7,'0003_seed_data.sql','2024-12-25 16:53:43');
-- INSERT INTO d1_migrations VALUES(8,'0000_concerned_the_fallen.sql','2025-01-02 16:46:00');
-- INSERT INTO d1_migrations VALUES(9,'0004_more_seed_data.sql','2025-01-02 16:46:00');
-- INSERT INTO d1_migrations VALUES(10,'0005_add_columns.sql','2025-01-02 16:46:01');
-- INSERT INTO d1_migrations VALUES(11,'0000_loose_arachne.sql','2025-01-02 23:59:33');
-- INSERT INTO d1_migrations VALUES(12,'0001_useful_sage.sql','2025-01-02 23:59:34');
-- INSERT INTO d1_migrations VALUES(13,'0000_black_midnight.sql','2025-01-03 23:32:38');
DROP TABLE IF EXISTS users;

CREATE TABLE `decks` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`hero_image_url` text,
	`ai_prompt` text,
	`wf_status` text,
	`createdAt` integer,
	`updatedAt` integer
);
INSERT INTO decks VALUES('1efcc672-50e3-62c0-8866-df7bfeac2626','testAI','','https://battledeck.app/1efcc73a-0bb0-6090-ad7d-c95a46edfdba',replace('Create a deck of slides for a presentation about the history of the internet.\n    Each slide should describe an image relating to a topic or concept from the history of the internet,\n    and should be no more than 3 sentences long.','\n',char(10)),'acknowledged',1736192884,1736192884);
INSERT INTO decks VALUES('1efcc6ed-17cf-6170-9e8e-ca9d3c6dae59','testHuman','','https://battledeck.app/battledeck_logo_outer_white_background.png',NULL,'acknowledged',1736196181,1736196181);
INSERT INTO decks VALUES('1efcc956-7b82-6710-ab1a-de843eb14b0c','testAI3','','https://battledeck.app/1efcc957-0ab4-6280-b0be-69403ec4e011',replace('Create a deck of slides for a presentation about the history of the internet.\n    Each slide should describe an image relating to a topic or concept from the history of the internet,\n    and should be no more than 3 sentences long.','\n',char(10)),'acknowledged',1736212753,1736212753);
CREATE TABLE `slides` (
	`id` text PRIMARY KEY NOT NULL,
	`deck_id` text NOT NULL,
	`deck_order` integer NOT NULL,
	`caption` text,
	`image_url` text,
	`wf_status` text,
	`createdAt` integer,
	`updatedAt` integer
);
INSERT INTO slides VALUES('1efcc672-5b9d-6c10-b9ea-6b7c42c74e31','1efcc672-50e3-62c0-8866-df7bfeac2626',0,'1960s computer room with mainframe and programmers working on early network systems','https://battledeck.app/1efcc73a-0bb0-6090-ad7d-c95a46edfdba','completed',1736192885,1736192885);
INSERT INTO slides VALUES('1efcc672-5b9d-6c11-8813-c9931b7ef1b4','1efcc672-50e3-62c0-8866-df7bfeac2626',1,'Early ARPANET diagram showing the first network connections between universities','https://battledeck.app/1efcc73a-7374-6fa0-9df5-437f3f215100','completed',1736192885,1736192885);
INSERT INTO slides VALUES('1efcc672-5b9d-6c12-81fb-e6c3b0f0608f','1efcc672-50e3-62c0-8866-df7bfeac2626',2,'1970s home computer with dial-up modem and phone line connecting to a bulletin board system','https://battledeck.app/1efcc73a-d784-6360-b63a-240e148f992d','completed',1736192885,1736192885);
INSERT INTO slides VALUES('1efcc672-5b9d-6c13-98cd-b89edace48af','1efcc672-50e3-62c0-8866-df7bfeac2626',3,'1980s internet cafe with people using computers and drinking coffee, symbolizing public access','https://battledeck.app/1efcc73b-35f0-6930-992f-6a7eee1c373b','completed',1736192885,1736192885);
INSERT INTO slides VALUES('1efcc672-5b9d-6c14-b5b5-82fcaa270aef','1efcc672-50e3-62c0-8866-df7bfeac2626',4,'World Wide Web inventor Tim Berners-Lee in front of a computer screen displaying the first website','https://battledeck.app/1efcc73b-968c-6050-861d-a416636a0c06','completed',1736192885,1736192885);
INSERT INTO slides VALUES('1efcc672-5b9d-6c15-b7d1-ec932130d45e','1efcc672-50e3-62c0-8866-df7bfeac2626',5,'1990s living room with family gathered around a desktop computer using America Online','https://battledeck.app/1efcc73b-f920-6d60-a3cd-2f7994723702','completed',1736192885,1736192885);
INSERT INTO slides VALUES('1efcc672-5b9d-6c16-bc9e-921e10be2d12','1efcc672-50e3-62c0-8866-df7bfeac2626',6,'Map of the world with lines representing underwater internet cables and global connectivity','https://battledeck.app/1efcc73c-55a0-6090-8635-26db569ca726','completed',1736192885,1736192885);
INSERT INTO slides VALUES('1efcc672-5b9d-6c17-917e-a23ac6de61eb','1efcc672-50e3-62c0-8866-df7bfeac2626',7,'Smartphone users browsing the internet on their mobile devices in a busy city street','https://battledeck.app/1efcc73c-c110-6eb0-9d86-0285960034d9','completed',1736192885,1736192885);
INSERT INTO slides VALUES('1efcc672-5b9d-6c18-ab34-298a2cf24a03','1efcc672-50e3-62c0-8866-df7bfeac2626',8,'Social media logos and profiles on a computer screen, representing online communities and networking','https://battledeck.app/1efcc73d-1da3-6a60-9d26-9843cfe40e5a','completed',1736192885,1736192885);
INSERT INTO slides VALUES('1efcc672-5b9d-6c19-9845-c28c6e1d4e4d','1efcc672-50e3-62c0-8866-df7bfeac2626',9,'Cybersecurity experts working in a monitoring room filled with screens displaying threat alerts and network traffic','https://battledeck.app/1efcc73d-80c1-62f0-bfa4-d5f2347598a8','completed',1736192885,1736192885);
INSERT INTO slides VALUES('1efcc6ed-20b9-6ce0-816e-2e1c195a6f80','1efcc6ed-17cf-6170-9e8e-ca9d3c6dae59',0,'The image features an illustrated cartoon-style representation of the Star Wars character, Darth Vader. He is featured in the center of a circle and looks as if he''s outside the circle''s border, possibly looking directly at you. His silouette stands against a dark blue-colored star field with a few shinning white stars. There is no facial expression taken to imply anger, sadness, or happiness.  Only the character''s helmet glows a dark blue glow to represent his breathing device (and his face). It appears to be a slightly above torso image. The dark blue circle serves as the background to the dark blue Star field featuring the small white dots representing stars. A kindergartner or toddler could enjoy this image.&#x20;','https://battledeck.app/battledeck_logo_outer_white_background.png','completed',1736196181,1736196181);
INSERT INTO slides VALUES('1efcc6ed-20b9-6ce1-8ad6-80cca5d5059b','1efcc6ed-17cf-6170-9e8e-ca9d3c6dae59',1,'The image serves as the home page of an app called "battledeck.app." The app allows users to play Cardfight Vanguard and create their decks. Abd on to a single platform or through the use of consoles for quick purchases and management of cards. BattleDeck allows players from all over to create a community that otheres. It caters to players anywhere,attend in-person tournaments, or connect with fellow players online. The battledeck app is described as "the digital deck builder where every game is a battle!" This app-round platform that''s designed to ing side each player plenty of game matches with a wide range of opponents from different countries','https://battledeck.app/battledeck_logo_white_background.png','completed',1736196181,1736196181);
INSERT INTO slides VALUES('1efcc6ed-20b9-6ce2-8360-c476efa73d82','1efcc6ed-17cf-6170-9e8e-ca9d3c6dae59',2,'The image displays a cartoon of Darth Vader''s head in a blue circle with the words "battledeck.app" below it. The background is black with stars.','https://battledeck.app/c0lli3r_a_logo_of_a_battledeck.app_simple_vector_--no_shading_30da4c77-61ea-44e2-9139-de0bd8999dff_2.png','completed',1736196181,1736196181);
INSERT INTO slides VALUES('1efcc6ed-20b9-6ce3-8dd9-444349d8b46e','1efcc6ed-17cf-6170-9e8e-ca9d3c6dae59',3,'The image is a fantasy artwork of a man with long white hair and pointed elf ears, holding a book that is emitting flames and sparks. The man has a serious expression on his face and is dressed in a flowing white and gold robe, adorned with intricate gold accents and a black belt with a golden buckle. The book he holds is black with gold lettering on the cover, and the flames and sparks emanating from it suggest that it is powerful and magical. The background of the image is a faded grayish-brown color, with a subtle texture that resembles the roughness of parchment or stone. Overall, the image conveys a sense of mysticism and ancient wisdom, with the man''s serious demeanor and the magical energy of the book creating a sense of awe and wonder.','https://battledeck.app/c0lli3r_eladrin_cleric_male_with_long_white_hair_and_fiery_am_fe62c101-c6f7-4259-8358-486287c06e1e_0.png','completed',1736196181,1736196181);
INSERT INTO slides VALUES('1efcc956-8326-6020-b1d2-140755a690b1','1efcc956-7b82-6710-ab1a-de843eb14b0c',0,'1960s computer room with mainframe computers and technicians','https://battledeck.app/1efcc957-0ab4-6280-b0be-69403ec4e011','completed',1736212754,1736212754);
INSERT INTO slides VALUES('1efcc956-8326-6021-8020-08d84d1e0be5','1efcc956-7b82-6710-ab1a-de843eb14b0c',1,'Early ARPANET network diagram showing connected nodes and lines','https://battledeck.app/1efcc957-6c0e-6080-9fad-75330c8915ea','completed',1736212754,1736212754);
INSERT INTO slides VALUES('1efcc956-8326-6022-86cd-fa3cc2ecaf30','1efcc956-7b82-6710-ab1a-de843eb14b0c',2,'1970s home computer with dial-up modem and phone line','https://battledeck.app/1efcc957-ca9c-6930-9fc2-8191d1db54e5','completed',1736212754,1736212754);
INSERT INTO slides VALUES('1efcc956-8326-6023-b04b-77e52bbc4d08','1efcc956-7b82-6710-ab1a-de843eb14b0c',3,'First website on a computer screen with simple HTML layout','https://battledeck.app/1efcc958-2b2b-6d00-a6e0-8478dc0733b1','completed',1736212754,1736212754);
INSERT INTO slides VALUES('1efcc956-8326-6024-a6e6-3034ba88c2d7','1efcc956-7b82-6710-ab1a-de843eb14b0c',4,'1990s internet cafe with people using desktop computers','https://battledeck.app/1efcc958-87c8-64f0-b3e6-7352d472c182','completed',1736212754,1736212754);
INSERT INTO slides VALUES('1efcc956-8326-6025-9b70-a248592bb593','1efcc956-7b82-6710-ab1a-de843eb14b0c',5,'Dial-up internet connection process illustration with phone and modem','https://battledeck.app/1efcc958-e9a1-6230-bb58-29e64000bc4c','completed',1736212754,1736212754);
INSERT INTO slides VALUES('1efcc956-8326-6026-8289-e67afab1f0f6','1efcc956-7b82-6710-ab1a-de843eb14b0c',6,'World Wide Web inventor Tim Berners-Lee at his desk with computer','https://battledeck.app/1efcc959-4b9e-6960-a244-f6997eb0d848','completed',1736212754,1736212754);
INSERT INTO slides VALUES('1efcc956-8326-6027-a989-f6f1cdf1b178','1efcc956-7b82-6710-ab1a-de843eb14b0c',7,'First smartphone with mobile internet access in someone''s hand','https://battledeck.app/1efcc959-abf5-6ac0-a661-c119172fcb5e','completed',1736212754,1736212754);
INSERT INTO slides VALUES('1efcc956-8326-6028-bb6b-c4cfd8fe5eb9','1efcc956-7b82-6710-ab1a-de843eb14b0c',8,'Social media platform login page on a laptop screen','https://battledeck.app/1efcc95a-0fb9-6390-b5b0-601b0deb6a91','completed',1736212754,1736212754);
INSERT INTO slides VALUES('1efcc956-8326-6029-94e1-cce35885b862','1efcc956-7b82-6710-ab1a-de843eb14b0c',9,'Futuristic illustration of global network connections and data exchange','https://battledeck.app/1efcc95a-72e7-6d90-a21d-fefc67b3cc32','completed',1736212754,1736212754);

-- CREATE TABLE `users` (
-- 	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
-- 	`email` text NOT NULL,
-- 	`createdAt` integer
-- );
-- DELETE FROM sqlite_sequence;
-- INSERT INTO sqlite_sequence VALUES('d1_migrations',13);
