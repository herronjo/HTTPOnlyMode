# HTTPOnlyMode
 A WebExtension to downgrade HTTPS requests to HTTP, and warn about secure websites

Created as a joke, HTTP Only Mode parodies the "Insecure Site" warnings you see on sites with invalid certificates, as well as the HTTPS Everywhere extension. It tries its best to force a HTTP only version of the site, and displays a warning for sites it can't unsecure with the option to whitelist the domain, as well as blocking HTTPS only resources from loading from un-whitelisted domains.

At the moment the extension relies on Manifest V2, it is uncertain if it's possible to implement in Manifest V3.

Tested in Firefox and Chromium.