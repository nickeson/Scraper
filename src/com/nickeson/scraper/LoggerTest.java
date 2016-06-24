package com.nickeson.scraper;

import java.net.URLConnection;

//JDK 1.8.0

// log4j-1.2.17.jar
import org.apache.log4j.Logger;
import org.apache.log4j.PropertyConfigurator;

/****************************************************************************
 * <b>Title</b>: Scraper.java <p/>
 * <b>Project</b>: Website Scraper <p/>
 * <b>Description: </b> A website scraper to locally save HTML, css and header 
 * information for Siliconmtn.com and all pages found in header and footer menus
 * while retaining absolute links to other content (images, audio, video, etc.)<p/>
 * <b>Copyright:</b> Copyright (c) 2016<p/>
 * <b>Company:</b> Silicon Mountain Technologies<p/>
 * @author nickeson
 * @version 1.0
 * @since Jun 22, 2016<p/>
 * updates:
 ****************************************************************************/

public class LoggerTest {

	static Logger log = null;

	public LoggerTest() {
		PropertyConfigurator.configure("scripts/log4j.properties");
		log = Logger.getLogger("LoggerTest");
	}

	public static void main(String[] args) {
		LoggerTest test= new LoggerTest();
		if(log.isDebugEnabled()) {
			log.debug("This is debug");
		}
		log.error("Logging an error");
	}
}