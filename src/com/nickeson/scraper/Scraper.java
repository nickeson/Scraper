package com.nickeson.scraper;

//JDK 1.8.0
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Properties;
import java.util.Set;
import javax.swing.text.BadLocationException;
import javax.swing.text.Element;
import javax.swing.text.ElementIterator;
import javax.swing.text.MutableAttributeSet;
import javax.swing.text.html.HTML;
import javax.swing.text.html.parser.ParserDelegator;
import javax.swing.text.html.HTMLDocument;
import javax.swing.text.html.HTMLEditorKit;

// log4j-1.2.17.jar
import org.apache.log4j.Logger;
import org.apache.log4j.PropertyConfigurator;

/****************************************************************************
 * <b>Title</b>: Scraper.java <p/>
 * <b>Project</b>: SMT Site Menu Scraper <p/>
 * <b>Description: </b>A website scraper to locally save content 
 * (HTML, .css, .js, etc.) and header information for all pages found in the 
 * Siliconmtn.com header and footer menu links, while retaining absolute links 
 * to other content (images, audio, video, etc.)<p/>
 * <b>Copyright:</b> Copyright (c) 2016<p/>
 * <b>Company:</b> Silicon Mountain Technologies<p/>
 * @author nickeson
 * @version 2.5
 * @since Jun 22, 2016<p/>
 * updates:
 ****************************************************************************/

public class Scraper {
	protected static Logger log = null;
	private	Path pathToFile = null;
	private Properties config = null;
	private HttpURLConnection connection = null;
	private String connectPath = null;
	private	String fileName = null;
	private	String finalOutFile = null;
	private String outDir = null;
	private	String sessionCookie = null;
	private	String suffix = null;
	private Set<String> linksToScrape = new LinkedHashSet<>();
	private Set<String> menuLinksList = new LinkedHashSet<>();
	private Set<String> resourcesList = new LinkedHashSet<>();
	public static final String ACCEPT_CHARSET = "acceptCharset";
	public static final String BASE_DOMAIN = "baseDomain";
	public static final String BASE_PORT = "basePort";
	public static final String LOG4J_LOCATION = "log4Jlocation";	
	public static final String MENU_PARSE_STRING = "menuParseString";
	public static final String SESSIONID_PARSE_STRING = "sessionIdParseString";
	public static final String OUTPUT_DIRECTORY = "outputDirectory";

	/**
	 * default constructor uses properties file to configure Scraper
	 */
	public Scraper() {
		try {
			FileInputStream fileInput = new FileInputStream("scripts/scraper.properties");
			config = new Properties();
			config.load(fileInput);
			fileInput.close();
			PropertyConfigurator.configure(config.getProperty(LOG4J_LOCATION));
			log = Logger.getLogger("Scraper");
			outDir = config.getProperty(OUTPUT_DIRECTORY);
			connection = (HttpURLConnection)(new URL(
				config.getProperty(BASE_DOMAIN) + ":" 
				+ config.getProperty(BASE_PORT)).openConnection());
			if (connection.getResponseCode() == 200) {
				storeSessionIdCookie(); // create persistent session cookie
				buildLinksLists(connection); // builds lists of URLs to parse/scrape
			} else log.error("Status Code: " + connection.getResponseCode()); 
		} catch (FileNotFoundException e) {
			log.error("Properties File Not Found");
			e.printStackTrace();
		} catch (MalformedURLException mue) {
			log.error("URL is invalid/malformed");
			mue.printStackTrace();
		} catch (IOException e) {
			log.error("Cannot load or close Properties File or connection");
			e.printStackTrace();
		} 
	}

	/**
	 * Store JSESSIONID cookie
	 * @throws IOException 
	 */
	protected void storeSessionIdCookie() throws IOException {
		List<String> rawCookies = connection.getHeaderFields().get("Set-Cookie");
		for (String rawCookie : rawCookies) {
			String[] cookies = rawCookie.split("; ");
			String cookie = cookies[0];
			String[] cookieValues = cookie.split("=");
			String cookieName = cookieValues[0];
			if (cookieName.equalsIgnoreCase(
					config.getProperty(SESSIONID_PARSE_STRING))) {
						sessionCookie = cookie;
			}
		}
		if (sessionCookie == null) log.error("Can't store " + config.getProperty(SESSIONID_PARSE_STRING)); 
	}

	/**
	 * Uses a seed HttpURLConnection to generate lists of Links contained in the seed
	 * @param connection the HttpURLConnection to use to generate the lists of links
	 */
	protected void buildLinksLists(HttpURLConnection connection) {
		HTMLEditorKit.Parser parser = new ParserDelegator();
		try {
			Reader in = new InputStreamReader(connection.getInputStream());
			parser.parse(in, new HTMLEditorKit.ParserCallback() {
				public void handleStartTag(HTML.Tag t, MutableAttributeSet a, int pos) {
					if (t == HTML.Tag.A) {
						Object link = a.getAttribute(HTML.Attribute.HREF);
						if (link != null && (!link.toString().startsWith("#")) &&
								(!link.toString().endsWith(".png")) && (!link.toString().endsWith(".jpg"))) {
							menuLinksList.add("" + link);
							if ((link.toString().toLowerCase().startsWith("http://")) || 
								(link.toString().toLowerCase().startsWith("https://"))) {
								linksToScrape.add("" + link);
							} else {
								linksToScrape.add(config.getProperty(BASE_DOMAIN) + link);
							}
						}
					}
				}
			}, true); in.close(); // closes upstream connection too
		} catch (IOException ioe) {
			log.error("Unable to store data - connection or filesystem errors");
			ioe.printStackTrace();
		}
	}

	/**
	 * Parses HttpURLConnection for paths to all resources tagged with SRC or HREF
	 * attribute, stores those resource paths to LinkedHashSet
	 * @param currConnection the HttpURLConnection to parse
	 * @throws IOException
	 * @throws BadLocationException
	 */
	protected void buildResourcesList(HttpURLConnection currConnection) throws IOException, BadLocationException {
		Element elem = null;
		InputStreamReader isr = new InputStreamReader(currConnection.getInputStream());
		HTMLEditorKit kit = new HTMLEditorKit();
		HTMLDocument doc = (HTMLDocument)kit.createDefaultDocument();
		doc.putProperty("IgnoreCharsetDirective", Boolean.TRUE);
		ElementIterator it = new ElementIterator(doc);
		kit.read(isr, doc, 0);
		while ((elem = it.next()) != null) {
			String s = (String)elem.getAttributes().getAttribute(HTML.Attribute.SRC);
			if (s != null && (!s.startsWith("//"))) { // don't include links for //maps or //ajax api's
				resourcesList.add(s);
			}
			String l = (String)elem.getAttributes().getAttribute(HTML.Attribute.HREF);
			if (l != null) {
				resourcesList.add(l);
			}
			// add code here to add missing msi / IE compatibility script resource
		} isr.close(); // closes upstream connection too
	}

	/**
	 * format menu links for paths to work properly (locally) when scraped
	 * @param inputString the current line of input from the file being scraped
	 * @param path the path component of the URL being scraped
	 * @return a modified input line with reformatted links
	 */
	protected String menuLinkFormatter(String inputString, String cnxnPath) {
	String replaceString = null;
		for (String currLink : menuLinksList) {
			if (inputString.contains(("href=\"" + config.getProperty(BASE_DOMAIN) + "\">"))) {
				inputString = inputString.replace((config.getProperty(BASE_DOMAIN) + "\""), "./index.html\"");
			}
			// add code here to fix links like: http://www.siliconmtn.com/innovation/technical-consulting (2 or more subdirs deep)
			if (inputString.contains(("href=\"" + currLink + "\">"))) {
				suffix = currLink.substring(currLink.lastIndexOf("/") + 1);
				if (inputString.contains("http://") || inputString.contains("https://")) {
					replaceString = "." + cnxnPath + "/" + suffix + "/" + suffix + ".html";
				} else {
					replaceString = "." + currLink + "/" + suffix + ".html";
				}
				inputString = inputString.replace(currLink, replaceString);
			}
		}
		return inputString;
	}
	
	/**
	 * format resource links for paths to work properly (locally) when scraped
	 * @param inString the current line of input from the file being scraped
	 * @return a modified input line with reformatted links
	 */
	protected String resourceListFormatter(String inString) {
		for (String resource : resourcesList) {
			if (!(resource.contains("http://") || resource.contains("https://"))) {
				if (inString.contains(resource)) {
					inString = inString.replace(resource, (config.getProperty(BASE_DOMAIN) + resource));
				}
			}
		}
		return inString;
	}

	/**
	 * Stores all data for a given HttpURLConnection to the specified file 
	 * @param currConnection the HttpURLConnection from which to store data
	 * @param file the file on the filesystem to which data is stored
	 * @throws IOException
	 */
	protected void storeURLData(HttpURLConnection currConnection, String file) throws IOException {
		String inputLine = null;
		BufferedReader br = new BufferedReader(new InputStreamReader(currConnection.getInputStream()));
		BufferedWriter out = new BufferedWriter(new FileWriter(new File(file)));
		while ((inputLine = br.readLine()) != null) {
		connectPath = currConnection.getURL().getPath();
			inputLine = menuLinkFormatter(inputLine, connectPath);
			inputLine = resourceListFormatter(inputLine);
			out.write(inputLine + "\r\n"); 
		} out.close();
	}
	
	/**
	 * Format given path to work on local filesystem copy of files
	 * @param currPath the path to format
	 */
	protected void pathFormatter(String currPath) {
		if (currPath.equalsIgnoreCase(fileName) && ((!currPath.equals("") && currPath != null))) {
			if ((fileName.endsWith(".png")) || fileName.endsWith(".jpg")) {
				finalOutFile = fileName;
				pathToFile = Paths.get(outDir + fileName);
			} else {
				finalOutFile = fileName.substring(fileName.lastIndexOf("/") + 1);
				pathToFile = Paths.get(outDir + currPath + "/" + finalOutFile + ".html");	
			}
		} else {
			if (currPath == null || currPath.equals("")) {
				finalOutFile = "/index.html";
			} else {
				finalOutFile = fileName + ".html";
			}
			pathToFile = Paths.get(outDir + currPath + finalOutFile);
		}
	}
	
	/**
	 * main method runs Scraper on seed URL from config file
	 * @param args
	 */
	public static void main(String[] args) {
		Scraper scraper = new Scraper();
		URL currURL = null;
		URLConnection currConnection = null;
		try {
			for (String link : scraper.linksToScrape) {
				currURL = new URL(link);	
				currConnection = currURL.openConnection();
				currConnection.setRequestProperty("Cookie", scraper.sessionCookie);
				if (((HttpURLConnection)currConnection).getResponseCode() == 200) {
					scraper.buildResourcesList((HttpURLConnection)currConnection); // auto-closes connection
					currConnection = currURL.openConnection();
					currConnection.setRequestProperty("Cookie", scraper.sessionCookie);
					scraper.fileName = currURL.getFile();
					scraper.pathFormatter(currURL.getPath());
					Files.createDirectories(scraper.pathToFile.getParent()); // build folder structure up to location of file 
					scraper.storeURLData((HttpURLConnection)currConnection, "" + scraper.pathToFile); // auto-closes connection
				} else log.error("Status Code: " + ((HttpURLConnection)currConnection).getResponseCode());
			}
		} catch (IOException | BadLocationException e) {
			log.error("I/O or BadLocationException");
			e.printStackTrace();
		}
	}
}