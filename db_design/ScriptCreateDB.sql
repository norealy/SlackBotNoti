CREATE DATABASE `botnoti`;

CREATE TABLE `Channel` (
  `id` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci

CREATE TABLE `MicrosoftCalendar` (
  `id` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `name` varchar(200) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `addressOwner` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8

CREATE TABLE `Event` (
  `id` varchar(255) NOT NULL,
  `idCalendar` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `type` varchar(100) NOT NULL,
  `timeStart` datetime NOT NULL,
  `timeEnd` datetime NOT NULL,
  `subject` varchar(200) NOT NULL,
  `content` varchar(200) NOT NULL,
  `timeUpdate` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `k9` (`idCalendar`),
  CONSTRAINT `k1` FOREIGN KEY (`idCalendar`) REFERENCES `MicrosoftCalendar` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8

CREATE TABLE `MessageSlack` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `idChannel` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `text` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `type` varchar(200) COLLATE utf8_unicode_ci DEFAULT NULL,
  `timeSend` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `k6` (`idChannel`),
  CONSTRAINT `k3` FOREIGN KEY (`idChannel`) REFERENCES `Channel` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci


CREATE TABLE `RoomUserSlack_Calendar` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `idGGCalendar` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `idMSCalendar` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `idChannel` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `k12` (`idMSCalendar`),
  KEY `k4` (`idChannel`),
  CONSTRAINT `k4` FOREIGN KEY (`idMSCalendar`) REFERENCES `MicrosoftCalendar` (`id`),
  CONSTRAINT `k5` FOREIGN KEY (`idChannel`) REFERENCES `Channel` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci

