CREATE TABLE `Channel` (
  `id` varchar(255) NOT NULL,
  `name` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `MessageSlack` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `idChannel` varchar(255) NOT NULL,
  `text` varchar(255) DEFAULT NULL,
  `type` varchar(200) DEFAULT NULL,
  `timeSend` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `k1` (`idChannel`),
  CONSTRAINT `k1` FOREIGN KEY (`idChannel`) REFERENCES `Channel` (`id`)
);

CREATE TABLE `GoogleCalendar` (
  `id` varchar(255) NOT NULL,
  `name` varchar(200) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `GoogleAccount` (
`id` varchar(255) NOT NULL,
`name` varchar(200) NOT NULL,
`refreshToken` varchar(255) NOT NULL,
 PRIMARY KEY (`id`)
 );

CREATE TABLE `MicrosoftCalendar` (
  `id` varchar(255) NOT NULL,
  `name` varchar(200) NOT NULL,
  `addressOwner` varchar(200) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `MicrosoftAccount` (
`id` varchar(255) NOT NULL,
`name` varchar(200) NOT NULL,
`refreshToken` varchar(255) NOT NULL,
 PRIMARY KEY (`id`)
 );

CREATE TABLE `GoogleAccountCalendar` (
  `idGGCalendar` varchar(255) NOT NULL,
  `idGGAccount` varchar(255) NOT NULL,
  CONSTRAINT k100 PRIMARY KEY (idGGCalendar,idGGAccount),
  KEY `k2` (`idGGCalendar`),
  KEY `k3` (`idGGAccount`),
  CONSTRAINT `k2` FOREIGN KEY (`idGGCalendar`) REFERENCES `GoogleCalendar` (`id`),
  CONSTRAINT `k3` FOREIGN KEY (`idGGAccount`) REFERENCES `GoogleAccount` (`id`)
);

CREATE TABLE `MicrosoftAccountCalendar` (
  `idMSCalendar` varchar(255) NOT NULL,
  `idMSAccount` varchar(255) NOT NULL,
  CONSTRAINT k101 PRIMARY KEY (idMSCalendar,idMSAccount),
  KEY `k4` (`idMSCalendar`),
  KEY `k5` (`idMSAccount`),
  CONSTRAINT `k4` FOREIGN KEY (`idMSCalendar`) REFERENCES `MicrosoftCalendar` (`id`),
  CONSTRAINT `k5` FOREIGN KEY (`idMSAccount`) REFERENCES `MicrosoftAccount` (`id`)
);

CREATE TABLE `SlackCalendar`(
  `idCalendar` VARCHAR(255) NOT NULL,
  `idChannel` VARCHAR(255) NOT NULL,
  KEY `k6` (`idChannel`),
  CONSTRAINT `k6` FOREIGN KEY (`idChannel`) REFERENCES `Channel` (`id`),
  CONSTRAINT k102 PRIMARY KEY(idCalendar, idChannel),
  INDEX (`idCalendar`, `idChannel`)
);

