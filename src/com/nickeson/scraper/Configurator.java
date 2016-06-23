package com.nickeson.scraper;

//JDK 1.8.0
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.Properties;

/****************************************************************************
 * <b>Title</b>: Configurator.java <p/>
 * <b>Project</b>: SMT Site Menu Scraper <p/>
 * <b>Description: </b> Configurator loads a .properties file into a Properties
 * object for extraction as key/value pairs.<p/>
 * <b>Copyright:</b> Copyright (c) 2016<p/>
 * <b>Company:</b> Silicon Mountain Technologies<p/>
 * @author nickeson
 * @version 1.0
 * @since Jun 23, 2016<p/>
 * updates:
 ****************************************************************************/

public class Configurator {

	private Properties config = null;

	/**
	 * default constructor requires passing a config properties File
	 * @param propertiesFile the configFile to use
	 */
	public Configurator(File propertiesFile) {
		try {
			// James mentioned using InputStreamReader here
			FileInputStream fileInput = new FileInputStream(propertiesFile);
			config = new Properties();
			config.load(fileInput);
			fileInput.close();
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		} 
	}

	/**
	 * return the contents of the properties config file (passed during construction) 
	 * as a Properties Object
	 * @return the config properties as a Properties Object
	 */
	public Properties getConfig() {
		return config;
	}

	// unit test
//	public static void main(String[] args) {
//		Configurator config = new Configurator();
//		System.out.println(config.loadProperties().getProperty("log4Jlocation"));
//	}
}