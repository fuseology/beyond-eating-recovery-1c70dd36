# Address audit report and proposed single-address change

No code has been changed. Searched src, public, scripts, index.html, README and .lovable, case-insensitive, skipping PDFs and images.

## Strings with zero matches
"9230", "Hwy 99", "98665", "bodyexpressions", "766-3399", "2882847891293830454" appears once only (see NAPConsistency). The "Suite 309" and "Evergreen" office address appears only in NAPConsistency and PrivacyNotice.

## Matches by file

**index.html** (live, static head schema)
- 64 streetAddress "1235 SE Division Street, Suite 104"
- 67 postalCode "97202"

**src/components/NAPConsistency.tsx** (shared address source)
- 18-19 comment: 1235 SE Division Street, Suite 104 / Portland, OR 97202
- 23-24 comment: 400 E. Evergreen Blvd, Suite 309 / Vancouver, WA 98660
- 66 businessNameFull "Beyond Eating Recovery of Portland"
- 70 email "info@beyondeating.com"
- 76, 80, 83 Portland street, zip and full address
- 88 googleMapsUrl cid=2882847891293830454
- 92 name "Vancouver Office"; 93, 97, 100 Vancouver Evergreen street, zip and full address

**src/pages/Index.tsx** (live homepage)
- 29 alternateName "Food Is Not The Enemy"
- 330 FAQ answer: "Portland (SE Division) and Vancouver (E. Evergreen) locations"
- 20, 45-49, 74-77, 167-186, 217 use NAP_DATA.locations.vancouver (Vancouver LocalBusiness schema, coordinates, map)

**src/pages/Contact.tsx** (live)
- 60, 113-125, 228-231 use NAP_DATA.locations.vancouver (city and state only, in schema areaServed)

**src/pages/Connect.tsx** (live)
- 18, 21 schema "1235 Southeast Division Street", "97202" (no suite)
- 188, 190 visible text "1235 Southeast Division Street" / "Portland, OR 97202"

**src/pages/Services.tsx** (live)
- 40, 43, 79, 82 schema "1235 SE Division Street, Suite 104" / "97202"

**src/pages/PrivacyNotice.tsx** (live)
- 25, 28 Portland Division / 97202
- 33, 36 "400 E. Evergreen Blvd, Suite 309" / 98660
- 41 email "info@beyondeating.com"

**src/pages/About.tsx** (live): 48 postalCode "98660"

**src/components/Footer.tsx** (live, every page): 51 YouTube link youtube.com/user/foodisnottheenemy (channel name, not an address)

**src/pages/OurApproach.tsx** (live): 756 visible text "your Food Is Not The Enemy therapist"

**Team bio pages** (all live). Each has schema with a third address, "1000 Broadway Suite 215, Vancouver, WA 98660", which none of your search strings catch directly:
- AnneCuthbert.tsx 47, 54 ("Vancouver Office"), 60
- AnnieCalhounRandall.tsx 51, 58, 64; plus 223 and 690 "Body Expressions" (her practicum history in her bio)
- BaileyBenn.tsx 49, 56, 62; plus 208 "Practicum: Food Is Not The Enemy"
- GinaParisi.tsx 46, 53, 59
- KiandraCole.tsx 50, 57, 63
- MackenzieStracke.tsx 46, 53, 59
- RachelBennett.tsx 49, 56, 62; plus 747 "evergreen forests" (ordinary prose)
- SaraKranich.tsx 51, 58, 64; plus 782 "Portland & Vancouver Offices"
- StephanieOkumura.tsx 45, 52, 58; plus 528 "Portland & Vancouver Offices"
- EmeryPederson.tsx 46; MaryCooper.tsx 44; MichelleCommons.tsx 44; MichelleMeredith.tsx 71 (98660 only)

Note: MackenzieStracke, StephanieOkumura, EmeryPederson, MaryCooper, MichelleCommons and MichelleMeredith files exist. Whether each is still linked in the menu and routes was not checked in this pass.

## Shared address helpers
- NAP_DATA.locations.vancouver: used in Index.tsx and Contact.tsx (both live).
- NAPBlock, NAPAddress, generateLocalBusinessSchema: defined in NAPConsistency.tsx only. **Nothing imports or renders them**, so they do not show on the live site.

## Phone number formats
"360-726-4141" appears 158 times and "(360) 726-4141" 32 times, across 48 files. Schema uses "+1-360-726-4141".

## The change: one address, "1235 SE Division St Suite 104, Portland, OR 97202", phone "(360) 726-4141"

Files that would need edits:
1. index.html: street format
2. NAPConsistency.tsx: Portland street and full address; remove or retire the Vancouver location; decide on the "of Portland" name, the email, and the comments
3. Index.tsx: remove the Vancouver LocalBusiness entry and change the FAQ line 330 text
4. Contact.tsx: Vancouver areaServed references (keep Vancouver as a served city, or remove it)
5. Connect.tsx: schema and visible address (add "Suite 104")
6. Services.tsx: street format
7. PrivacyNotice.tsx: street format, remove the Evergreen address, email
8. About.tsx: 98660 schema
9. All 13 bio pages listed above: replace the 1000 Broadway / 98660 schema; SaraKranich and StephanieOkumura "Portland & Vancouver Offices" text
10. Phone: about 48 files if every "360-726-4141" must read "(360) 726-4141" in visible text (schema should stay in +1 format)

Leave as is: Footer YouTube channel link, the OurApproach and BaileyBenn "Food Is Not The Enemy" mentions, the AnnieCalhounRandall "Body Expressions" history, the RachelBennett "evergreen forests" line. These are history or links, not addresses.

## Questions before building
- Is Vancouver no longer an office at all? If so, should Vancouver stay listed as a served area (telehealth for WA)?
- Should the email be intakes@beyondeatingrecovery.com everywhere instead of info@beyondeating.com?
- Should the phone format change in visible text only, or in the structured data too?
