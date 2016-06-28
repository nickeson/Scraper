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
 * @version 2.0
 * @since Jun 22, 2016<p/>
 * updates:
 ****************************************************************************/

public class Scraper {
	protected static Logger log = null;
	private Properties config = null;
	private HttpURLConnection connection = null;
	private String outDir = null;
	private	String sessionCookie = null;
	private Set<String> linksList = null;
	private Set<String> resourceList = null;
	public static final String ACCEPT_CHARSET = "acceptCharset";
	public static final String BASE_DOMAIN = "baseDomain";
	public static final String BASE_PORT = "basePort";
	public static final String LOG4J_LOCATION = "log4Jlocation";	
	public static final String MENU_PARSE_STRING = "menuParseString";
	public static final String SESSIONID_PARSE_STRING = "sessionIdParseString";
	public static final String OUTPUT_DIRECTORY = "outputDirectory";

	/**
	 * default constructor needs a predefined properties file to configure Scraper
	 */
	public Scraper() {
		try {
			FileInputStream fileInput = new FileInputStream("scripts/scraper.properties");
			config = new Properties();
			config.load(fileInput);
			fileInput.close();
			PropertyConfigurator.configure(config.getProperty(LOG4J_LOCATION));
			log = Logger.getLogger("Scraper");
			connection = (HttpURLConnection)(new URL(
				config.getProperty(BASE_DOMAIN) + ":" 
				+ config.getProperty(BASE_PORT)).openConnection());
			if (connection.getResponseCode() == 200) {
				storeSessionIdCookie(); // create persistent session cookie
				buildLinksList(connection); // builds list of menu URLs to parse/store
				outDir = config.getProperty(OUTPUT_DIRECTORY);
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
	public void storeSessionIdCookie() throws IOException {
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
	 * Uses a seed HttpURLConnection to generate a list of Links contained in the seed
	 * @param connection the HttpURLConnection to use to generate the List of Links
	 */
	public void buildLinksList(HttpURLConnection connection) {
		linksList = new LinkedHashSet<>();
		HTMLEditorKit.Parser parser = new ParserDelegator();
		try {
			Reader in = new InputStreamReader(connection.getInputStream());
			parser.parse(in, new HTMLEditorKit.ParserCallback() {
				public void handleStartTag(HTML.Tag t, MutableAttributeSet a, int pos) {
					if (t == HTML.Tag.A) {
						Object link = a.getAttribute(HTML.Attribute.HREF);
						if (link != null && (!link.toString().startsWith("#"))) {
							if ((link.toString().toLowerCase().startsWith("http://")) || 
								(link.toString().toLowerCase().startsWith("https://"))) {
								linksList.add("" + link);
							} else {
								linksList.add(config.getProperty(BASE_DOMAIN) + link);
							}
						}
					}
				}
			}, true); in.close();
		} catch (IOException ioe) {
			log.error("Unable to store data - connection or filesystem errors");
			ioe.printStackTrace();
		}
	}
	
	/**
	 * Extracts all resource links from an HttpURLConnection to a unique Set
	 * @param currConnection the HttpURLConnection from which to extract resource links
	 * @throws IOException 
	 */
	public void storeURLData(HttpURLConnection currConnection, String file) throws IOException {
		String inputLine = null;
		BufferedReader br = new BufferedReader(new InputStreamReader(currConnection.getInputStream()));
		BufferedWriter out = new BufferedWriter(new FileWriter(new File(file)));
		while ((inputLine = br.readLine()) != null) { // store all output to file
			out.write(inputLine + "\n");
		} out.close();
	}

	/**
	 * Parses HttpURLConnection for paths to all resources tagged with SRC 
	 * attribute, stores those resource paths to LinkedHashSet
	 * @param currConnection the HttpURLConnection to parse
	 * @throws IOException
	 * @throws BadLocationException
	 */
	public void parseURLData(HttpURLConnection currConnection) throws IOException, BadLocationException {
		Element elem = null;
		InputStreamReader isr = new InputStreamReader(currConnection.getInputStream());
		HTMLEditorKit kit = new HTMLEditorKit();
		HTMLDocument doc = (HTMLDocument)kit.createDefaultDocument();
		doc.putProperty("IgnoreCharsetDirective", Boolean.TRUE);
		ElementIterator it = new ElementIterator(doc);
		resourceList = new LinkedHashSet<>();	
		kit.read(isr, doc, 0);
		while ((elem = it.next()) != null) { // store a list of all resources for this page
			String s = (String)elem.getAttributes().getAttribute(HTML.Attribute.SRC);
			if (s != null) {
				resourceList.add(s);
			}
		} isr.close();
	}
	
	/**
	 * main method runs Scraper
	 * @param args
	 */
	public static void main(String[] args) {
		Scraper scraper = new Scraper();
		URL resourceURL = null;
		URLConnection currConnection = null;
		String fileName = null;
		String path = null;
		String finalOutFile = null;
		Path pathToFile = null;
		try {
			for (String link : scraper.linksList) {
				resourceURL = new URL(link);	
				currConnection = resourceURL.openConnection();
				currConnection.setRequestProperty("Cookie", scraper.sessionCookie);
				if (((HttpURLConnection)currConnection).getResponseCode() == 200) {
					scraper.parseURLData((HttpURLConnection)currConnection); // auto-closes connection
					currConnection = resourceURL.openConnection();
					currConnection.setRequestProperty("Cookie", scraper.sessionCookie);
					path = resourceURL.getPath();
					fileName = resourceURL.getFile();
					if (path.equalsIgnoreCase(fileName) && ((!path.equals("") && path != null))) {
						if ((fileName.endsWith(".png")) || fileName.endsWith(".jpg")) {
							finalOutFile = fileName;
							pathToFile = Paths.get(scraper.outDir + fileName);
						} else {
							finalOutFile = fileName.substring(fileName.lastIndexOf("/") + 1);
							pathToFile = Paths.get(scraper.outDir + path + "/" + finalOutFile + ".html");	
						}
					} else {
						if (path == null || path.equals("")) {
							finalOutFile = "/index.html";
							pathToFile = Paths.get(scraper.outDir + path + finalOutFile);
						} else {
							finalOutFile = fileName + ".html";
							pathToFile = Paths.get(scraper.outDir + path + finalOutFile);
						}
					}
					log.debug("pathToFile: " + pathToFile);
					Files.createDirectories(pathToFile.getParent());
					scraper.storeURLData((HttpURLConnection)currConnection, "" + pathToFile); // auto-closes connection
				} else log.error("Status Code: " + ((HttpURLConnection)currConnection).getResponseCode());
			}
			log.debug("resourceList: " + scraper.resourceList);
			// loop through all remaining resources & save them to filesystem
			for (String link : scraper.resourceList) {
				resourceURL = new URL(scraper.config.getProperty(BASE_DOMAIN) + link);
				log.debug("resourceURL: " + resourceURL);
				currConnection = resourceURL.openConnection();
				currConnection.setRequestProperty("Cookie", scraper.sessionCookie);
				if (((HttpURLConnection)currConnection).getResponseCode() == 200) {
					path = resourceURL.getPath();
					fileName = resourceURL.getFile();
					log.debug("fileName: " + fileName);
					pathToFile = Paths.get(scraper.outDir + fileName);
					log.debug("pathToFile(resource) " + pathToFile);
					Files.createDirectories(pathToFile.getParent());
					scraper.storeURLData((HttpURLConnection)currConnection, "" + pathToFile);
				}
			}
		} catch (IOException | BadLocationException e) {
			log.error("I/O or BadLocationException");
			e.printStackTrace();
		}
	}
}