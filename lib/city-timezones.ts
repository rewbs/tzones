// City to IANA timezone mapping
// ~500 major cities organized by region for easy maintenance

export interface CityEntry {
    city: string
    country: string
    timezone: string
    aliases?: string[] // Alternative names/spellings
}

export const CITY_TIMEZONES: CityEntry[] = [
    // ============================================
    // NORTH AMERICA
    // ============================================

    // USA - Pacific
    { city: "Los Angeles", country: "USA", timezone: "America/Los_Angeles", aliases: ["LA"] },
    { city: "San Francisco", country: "USA", timezone: "America/Los_Angeles", aliases: ["SF", "Bay Area"] },
    { city: "San Diego", country: "USA", timezone: "America/Los_Angeles" },
    { city: "San Jose", country: "USA", timezone: "America/Los_Angeles" },
    { city: "Seattle", country: "USA", timezone: "America/Los_Angeles" },
    { city: "Portland", country: "USA", timezone: "America/Los_Angeles" },
    { city: "Las Vegas", country: "USA", timezone: "America/Los_Angeles" },
    { city: "Sacramento", country: "USA", timezone: "America/Los_Angeles" },
    { city: "Oakland", country: "USA", timezone: "America/Los_Angeles" },
    { city: "Fresno", country: "USA", timezone: "America/Los_Angeles" },

    // USA - Mountain
    { city: "Denver", country: "USA", timezone: "America/Denver" },
    { city: "Phoenix", country: "USA", timezone: "America/Phoenix" },
    { city: "Salt Lake City", country: "USA", timezone: "America/Denver" },
    { city: "Albuquerque", country: "USA", timezone: "America/Denver" },
    { city: "Tucson", country: "USA", timezone: "America/Phoenix" },
    { city: "Boise", country: "USA", timezone: "America/Boise" },
    { city: "Colorado Springs", country: "USA", timezone: "America/Denver" },

    // USA - Central
    { city: "Chicago", country: "USA", timezone: "America/Chicago" },
    { city: "Houston", country: "USA", timezone: "America/Chicago" },
    { city: "Dallas", country: "USA", timezone: "America/Chicago" },
    { city: "Austin", country: "USA", timezone: "America/Chicago" },
    { city: "San Antonio", country: "USA", timezone: "America/Chicago" },
    { city: "Minneapolis", country: "USA", timezone: "America/Chicago" },
    { city: "Kansas City", country: "USA", timezone: "America/Chicago" },
    { city: "St. Louis", country: "USA", timezone: "America/Chicago", aliases: ["Saint Louis"] },
    { city: "New Orleans", country: "USA", timezone: "America/Chicago" },
    { city: "Milwaukee", country: "USA", timezone: "America/Chicago" },
    { city: "Oklahoma City", country: "USA", timezone: "America/Chicago" },
    { city: "Nashville", country: "USA", timezone: "America/Chicago" },
    { city: "Memphis", country: "USA", timezone: "America/Chicago" },
    { city: "Louisville", country: "USA", timezone: "America/Kentucky/Louisville" },
    { city: "Fort Worth", country: "USA", timezone: "America/Chicago" },
    { city: "El Paso", country: "USA", timezone: "America/Denver" },
    { city: "Omaha", country: "USA", timezone: "America/Chicago" },

    // USA - Eastern
    { city: "New York", country: "USA", timezone: "America/New_York", aliases: ["NYC", "New York City", "Manhattan"] },
    { city: "Miami", country: "USA", timezone: "America/New_York" },
    { city: "Atlanta", country: "USA", timezone: "America/New_York" },
    { city: "Boston", country: "USA", timezone: "America/New_York" },
    { city: "Philadelphia", country: "USA", timezone: "America/New_York", aliases: ["Philly"] },
    { city: "Washington", country: "USA", timezone: "America/New_York", aliases: ["Washington DC", "DC", "Washington D.C."] },
    { city: "Detroit", country: "USA", timezone: "America/Detroit" },
    { city: "Charlotte", country: "USA", timezone: "America/New_York" },
    { city: "Baltimore", country: "USA", timezone: "America/New_York" },
    { city: "Orlando", country: "USA", timezone: "America/New_York" },
    { city: "Tampa", country: "USA", timezone: "America/New_York" },
    { city: "Pittsburgh", country: "USA", timezone: "America/New_York" },
    { city: "Cleveland", country: "USA", timezone: "America/New_York" },
    { city: "Cincinnati", country: "USA", timezone: "America/New_York" },
    { city: "Indianapolis", country: "USA", timezone: "America/Indiana/Indianapolis" },
    { city: "Columbus", country: "USA", timezone: "America/New_York" },
    { city: "Raleigh", country: "USA", timezone: "America/New_York" },
    { city: "Jacksonville", country: "USA", timezone: "America/New_York" },
    { city: "Richmond", country: "USA", timezone: "America/New_York" },
    { city: "Buffalo", country: "USA", timezone: "America/New_York" },
    { city: "Hartford", country: "USA", timezone: "America/New_York" },
    { city: "Providence", country: "USA", timezone: "America/New_York" },

    // USA - Alaska & Hawaii
    { city: "Anchorage", country: "USA", timezone: "America/Anchorage" },
    { city: "Honolulu", country: "USA", timezone: "Pacific/Honolulu", aliases: ["Hawaii"] },
    { city: "Juneau", country: "USA", timezone: "America/Juneau" },

    // Canada
    { city: "Toronto", country: "Canada", timezone: "America/Toronto" },
    { city: "Vancouver", country: "Canada", timezone: "America/Vancouver" },
    { city: "Montreal", country: "Canada", timezone: "America/Montreal", aliases: ["Montréal"] },
    { city: "Calgary", country: "Canada", timezone: "America/Edmonton" },
    { city: "Edmonton", country: "Canada", timezone: "America/Edmonton" },
    { city: "Ottawa", country: "Canada", timezone: "America/Toronto" },
    { city: "Winnipeg", country: "Canada", timezone: "America/Winnipeg" },
    { city: "Quebec City", country: "Canada", timezone: "America/Toronto", aliases: ["Québec"] },
    { city: "Halifax", country: "Canada", timezone: "America/Halifax" },
    { city: "Victoria", country: "Canada", timezone: "America/Vancouver" },
    { city: "Regina", country: "Canada", timezone: "America/Regina" },
    { city: "Saskatoon", country: "Canada", timezone: "America/Regina" },
    { city: "St. John's", country: "Canada", timezone: "America/St_Johns", aliases: ["Saint John's"] },

    // Mexico
    { city: "Mexico City", country: "Mexico", timezone: "America/Mexico_City", aliases: ["CDMX", "Ciudad de México"] },
    { city: "Guadalajara", country: "Mexico", timezone: "America/Mexico_City" },
    { city: "Monterrey", country: "Mexico", timezone: "America/Monterrey" },
    { city: "Tijuana", country: "Mexico", timezone: "America/Tijuana" },
    { city: "Cancun", country: "Mexico", timezone: "America/Cancun", aliases: ["Cancún"] },
    { city: "Puebla", country: "Mexico", timezone: "America/Mexico_City" },
    { city: "Merida", country: "Mexico", timezone: "America/Merida", aliases: ["Mérida"] },

    // ============================================
    // CENTRAL AMERICA & CARIBBEAN
    // ============================================
    { city: "Havana", country: "Cuba", timezone: "America/Havana", aliases: ["La Habana"] },
    { city: "San Juan", country: "Puerto Rico", timezone: "America/Puerto_Rico" },
    { city: "Santo Domingo", country: "Dominican Republic", timezone: "America/Santo_Domingo" },
    { city: "Kingston", country: "Jamaica", timezone: "America/Jamaica" },
    { city: "Guatemala City", country: "Guatemala", timezone: "America/Guatemala" },
    { city: "Panama City", country: "Panama", timezone: "America/Panama" },
    { city: "San Jose", country: "Costa Rica", timezone: "America/Costa_Rica" },
    { city: "San Salvador", country: "El Salvador", timezone: "America/El_Salvador" },
    { city: "Tegucigalpa", country: "Honduras", timezone: "America/Tegucigalpa" },
    { city: "Managua", country: "Nicaragua", timezone: "America/Managua" },
    { city: "Nassau", country: "Bahamas", timezone: "America/Nassau" },
    { city: "Port-au-Prince", country: "Haiti", timezone: "America/Port-au-Prince" },

    // ============================================
    // SOUTH AMERICA
    // ============================================
    { city: "São Paulo", country: "Brazil", timezone: "America/Sao_Paulo", aliases: ["Sao Paulo"] },
    { city: "Rio de Janeiro", country: "Brazil", timezone: "America/Sao_Paulo", aliases: ["Rio"] },
    { city: "Brasilia", country: "Brazil", timezone: "America/Sao_Paulo", aliases: ["Brasília"] },
    { city: "Salvador", country: "Brazil", timezone: "America/Bahia" },
    { city: "Fortaleza", country: "Brazil", timezone: "America/Fortaleza" },
    { city: "Belo Horizonte", country: "Brazil", timezone: "America/Sao_Paulo" },
    { city: "Manaus", country: "Brazil", timezone: "America/Manaus" },
    { city: "Curitiba", country: "Brazil", timezone: "America/Sao_Paulo" },
    { city: "Recife", country: "Brazil", timezone: "America/Recife" },
    { city: "Porto Alegre", country: "Brazil", timezone: "America/Sao_Paulo" },

    { city: "Buenos Aires", country: "Argentina", timezone: "America/Argentina/Buenos_Aires" },
    { city: "Cordoba", country: "Argentina", timezone: "America/Argentina/Cordoba", aliases: ["Córdoba"] },
    { city: "Rosario", country: "Argentina", timezone: "America/Argentina/Buenos_Aires" },
    { city: "Mendoza", country: "Argentina", timezone: "America/Argentina/Mendoza" },

    { city: "Lima", country: "Peru", timezone: "America/Lima" },
    { city: "Bogota", country: "Colombia", timezone: "America/Bogota", aliases: ["Bogotá"] },
    { city: "Medellin", country: "Colombia", timezone: "America/Bogota", aliases: ["Medellín"] },
    { city: "Cali", country: "Colombia", timezone: "America/Bogota" },
    { city: "Cartagena", country: "Colombia", timezone: "America/Bogota" },

    { city: "Santiago", country: "Chile", timezone: "America/Santiago" },
    { city: "Valparaiso", country: "Chile", timezone: "America/Santiago", aliases: ["Valparaíso"] },

    { city: "Caracas", country: "Venezuela", timezone: "America/Caracas" },
    { city: "Quito", country: "Ecuador", timezone: "America/Guayaquil" },
    { city: "Guayaquil", country: "Ecuador", timezone: "America/Guayaquil" },
    { city: "Montevideo", country: "Uruguay", timezone: "America/Montevideo" },
    { city: "Asuncion", country: "Paraguay", timezone: "America/Asuncion", aliases: ["Asunción"] },
    { city: "La Paz", country: "Bolivia", timezone: "America/La_Paz" },
    { city: "Santa Cruz", country: "Bolivia", timezone: "America/La_Paz" },

    // ============================================
    // WESTERN EUROPE
    // ============================================
    { city: "London", country: "UK", timezone: "Europe/London" },
    { city: "Manchester", country: "UK", timezone: "Europe/London" },
    { city: "Birmingham", country: "UK", timezone: "Europe/London" },
    { city: "Glasgow", country: "UK", timezone: "Europe/London" },
    { city: "Liverpool", country: "UK", timezone: "Europe/London" },
    { city: "Edinburgh", country: "UK", timezone: "Europe/London" },
    { city: "Bristol", country: "UK", timezone: "Europe/London" },
    { city: "Leeds", country: "UK", timezone: "Europe/London" },
    { city: "Belfast", country: "UK", timezone: "Europe/London" },
    { city: "Cardiff", country: "UK", timezone: "Europe/London" },

    { city: "Dublin", country: "Ireland", timezone: "Europe/Dublin" },
    { city: "Cork", country: "Ireland", timezone: "Europe/Dublin" },

    { city: "Paris", country: "France", timezone: "Europe/Paris" },
    { city: "Lyon", country: "France", timezone: "Europe/Paris" },
    { city: "Marseille", country: "France", timezone: "Europe/Paris" },
    { city: "Toulouse", country: "France", timezone: "Europe/Paris" },
    { city: "Nice", country: "France", timezone: "Europe/Paris" },
    { city: "Nantes", country: "France", timezone: "Europe/Paris" },
    { city: "Bordeaux", country: "France", timezone: "Europe/Paris" },
    { city: "Lille", country: "France", timezone: "Europe/Paris" },
    { city: "Strasbourg", country: "France", timezone: "Europe/Paris" },

    { city: "Berlin", country: "Germany", timezone: "Europe/Berlin" },
    { city: "Munich", country: "Germany", timezone: "Europe/Berlin", aliases: ["München"] },
    { city: "Hamburg", country: "Germany", timezone: "Europe/Berlin" },
    { city: "Frankfurt", country: "Germany", timezone: "Europe/Berlin" },
    { city: "Cologne", country: "Germany", timezone: "Europe/Berlin", aliases: ["Köln"] },
    { city: "Stuttgart", country: "Germany", timezone: "Europe/Berlin" },
    { city: "Dusseldorf", country: "Germany", timezone: "Europe/Berlin", aliases: ["Düsseldorf"] },
    { city: "Leipzig", country: "Germany", timezone: "Europe/Berlin" },
    { city: "Dortmund", country: "Germany", timezone: "Europe/Berlin" },
    { city: "Essen", country: "Germany", timezone: "Europe/Berlin" },
    { city: "Dresden", country: "Germany", timezone: "Europe/Berlin" },
    { city: "Hanover", country: "Germany", timezone: "Europe/Berlin", aliases: ["Hannover"] },
    { city: "Nuremberg", country: "Germany", timezone: "Europe/Berlin", aliases: ["Nürnberg"] },

    { city: "Amsterdam", country: "Netherlands", timezone: "Europe/Amsterdam" },
    { city: "Rotterdam", country: "Netherlands", timezone: "Europe/Amsterdam" },
    { city: "The Hague", country: "Netherlands", timezone: "Europe/Amsterdam", aliases: ["Den Haag"] },
    { city: "Utrecht", country: "Netherlands", timezone: "Europe/Amsterdam" },
    { city: "Eindhoven", country: "Netherlands", timezone: "Europe/Amsterdam" },

    { city: "Brussels", country: "Belgium", timezone: "Europe/Brussels", aliases: ["Bruxelles"] },
    { city: "Antwerp", country: "Belgium", timezone: "Europe/Brussels" },
    { city: "Ghent", country: "Belgium", timezone: "Europe/Brussels" },

    { city: "Luxembourg", country: "Luxembourg", timezone: "Europe/Luxembourg" },

    { city: "Zurich", country: "Switzerland", timezone: "Europe/Zurich", aliases: ["Zürich"] },
    { city: "Geneva", country: "Switzerland", timezone: "Europe/Zurich", aliases: ["Genève"] },
    { city: "Basel", country: "Switzerland", timezone: "Europe/Zurich" },
    { city: "Bern", country: "Switzerland", timezone: "Europe/Zurich" },

    { city: "Vienna", country: "Austria", timezone: "Europe/Vienna", aliases: ["Wien"] },
    { city: "Salzburg", country: "Austria", timezone: "Europe/Vienna" },
    { city: "Innsbruck", country: "Austria", timezone: "Europe/Vienna" },
    { city: "Graz", country: "Austria", timezone: "Europe/Vienna" },

    // ============================================
    // SOUTHERN EUROPE
    // ============================================
    { city: "Madrid", country: "Spain", timezone: "Europe/Madrid" },
    { city: "Barcelona", country: "Spain", timezone: "Europe/Madrid" },
    { city: "Valencia", country: "Spain", timezone: "Europe/Madrid" },
    { city: "Seville", country: "Spain", timezone: "Europe/Madrid", aliases: ["Sevilla"] },
    { city: "Bilbao", country: "Spain", timezone: "Europe/Madrid" },
    { city: "Malaga", country: "Spain", timezone: "Europe/Madrid", aliases: ["Málaga"] },
    { city: "Palma", country: "Spain", timezone: "Europe/Madrid", aliases: ["Palma de Mallorca"] },

    { city: "Lisbon", country: "Portugal", timezone: "Europe/Lisbon", aliases: ["Lisboa"] },
    { city: "Porto", country: "Portugal", timezone: "Europe/Lisbon" },

    { city: "Rome", country: "Italy", timezone: "Europe/Rome", aliases: ["Roma"] },
    { city: "Milan", country: "Italy", timezone: "Europe/Rome", aliases: ["Milano"] },
    { city: "Naples", country: "Italy", timezone: "Europe/Rome", aliases: ["Napoli"] },
    { city: "Turin", country: "Italy", timezone: "Europe/Rome", aliases: ["Torino"] },
    { city: "Florence", country: "Italy", timezone: "Europe/Rome", aliases: ["Firenze"] },
    { city: "Venice", country: "Italy", timezone: "Europe/Rome", aliases: ["Venezia"] },
    { city: "Bologna", country: "Italy", timezone: "Europe/Rome" },
    { city: "Genoa", country: "Italy", timezone: "Europe/Rome", aliases: ["Genova"] },
    { city: "Palermo", country: "Italy", timezone: "Europe/Rome" },

    { city: "Athens", country: "Greece", timezone: "Europe/Athens", aliases: ["Athina"] },
    { city: "Thessaloniki", country: "Greece", timezone: "Europe/Athens" },

    { city: "Monaco", country: "Monaco", timezone: "Europe/Monaco" },
    { city: "Malta", country: "Malta", timezone: "Europe/Malta", aliases: ["Valletta"] },
    { city: "Andorra", country: "Andorra", timezone: "Europe/Andorra", aliases: ["Andorra la Vella"] },

    // ============================================
    // NORTHERN EUROPE
    // ============================================
    { city: "Stockholm", country: "Sweden", timezone: "Europe/Stockholm" },
    { city: "Gothenburg", country: "Sweden", timezone: "Europe/Stockholm", aliases: ["Göteborg"] },
    { city: "Malmo", country: "Sweden", timezone: "Europe/Stockholm", aliases: ["Malmö"] },

    { city: "Oslo", country: "Norway", timezone: "Europe/Oslo" },
    { city: "Bergen", country: "Norway", timezone: "Europe/Oslo" },
    { city: "Trondheim", country: "Norway", timezone: "Europe/Oslo" },

    { city: "Copenhagen", country: "Denmark", timezone: "Europe/Copenhagen", aliases: ["København"] },
    { city: "Aarhus", country: "Denmark", timezone: "Europe/Copenhagen" },

    { city: "Helsinki", country: "Finland", timezone: "Europe/Helsinki" },
    { city: "Tampere", country: "Finland", timezone: "Europe/Helsinki" },
    { city: "Turku", country: "Finland", timezone: "Europe/Helsinki" },

    { city: "Reykjavik", country: "Iceland", timezone: "Atlantic/Reykjavik", aliases: ["Reykjavík"] },

    // ============================================
    // EASTERN EUROPE
    // ============================================
    { city: "Moscow", country: "Russia", timezone: "Europe/Moscow", aliases: ["Moskva"] },
    { city: "Saint Petersburg", country: "Russia", timezone: "Europe/Moscow", aliases: ["St. Petersburg", "St Petersburg"] },
    { city: "Novosibirsk", country: "Russia", timezone: "Asia/Novosibirsk" },
    { city: "Yekaterinburg", country: "Russia", timezone: "Asia/Yekaterinburg" },
    { city: "Kazan", country: "Russia", timezone: "Europe/Moscow" },
    { city: "Nizhny Novgorod", country: "Russia", timezone: "Europe/Moscow" },
    { city: "Vladivostok", country: "Russia", timezone: "Asia/Vladivostok" },
    { city: "Kaliningrad", country: "Russia", timezone: "Europe/Kaliningrad" },
    { city: "Sochi", country: "Russia", timezone: "Europe/Moscow" },

    { city: "Warsaw", country: "Poland", timezone: "Europe/Warsaw", aliases: ["Warszawa"] },
    { city: "Krakow", country: "Poland", timezone: "Europe/Warsaw", aliases: ["Kraków", "Cracow"] },
    { city: "Wroclaw", country: "Poland", timezone: "Europe/Warsaw", aliases: ["Wrocław"] },
    { city: "Gdansk", country: "Poland", timezone: "Europe/Warsaw", aliases: ["Gdańsk"] },
    { city: "Poznan", country: "Poland", timezone: "Europe/Warsaw", aliases: ["Poznań"] },

    { city: "Prague", country: "Czech Republic", timezone: "Europe/Prague", aliases: ["Praha"] },
    { city: "Brno", country: "Czech Republic", timezone: "Europe/Prague" },

    { city: "Budapest", country: "Hungary", timezone: "Europe/Budapest" },

    { city: "Bucharest", country: "Romania", timezone: "Europe/Bucharest", aliases: ["București"] },
    { city: "Cluj-Napoca", country: "Romania", timezone: "Europe/Bucharest" },

    { city: "Sofia", country: "Bulgaria", timezone: "Europe/Sofia" },

    { city: "Kyiv", country: "Ukraine", timezone: "Europe/Kyiv", aliases: ["Kiev"] },
    { city: "Kharkiv", country: "Ukraine", timezone: "Europe/Kyiv" },
    { city: "Odesa", country: "Ukraine", timezone: "Europe/Kyiv", aliases: ["Odessa"] },
    { city: "Lviv", country: "Ukraine", timezone: "Europe/Kyiv" },

    { city: "Minsk", country: "Belarus", timezone: "Europe/Minsk" },

    { city: "Bratislava", country: "Slovakia", timezone: "Europe/Bratislava" },
    { city: "Ljubljana", country: "Slovenia", timezone: "Europe/Ljubljana" },
    { city: "Zagreb", country: "Croatia", timezone: "Europe/Zagreb" },
    { city: "Split", country: "Croatia", timezone: "Europe/Zagreb" },
    { city: "Belgrade", country: "Serbia", timezone: "Europe/Belgrade", aliases: ["Beograd"] },
    { city: "Sarajevo", country: "Bosnia", timezone: "Europe/Sarajevo" },
    { city: "Skopje", country: "North Macedonia", timezone: "Europe/Skopje" },
    { city: "Tirana", country: "Albania", timezone: "Europe/Tirane" },
    { city: "Podgorica", country: "Montenegro", timezone: "Europe/Podgorica" },
    { city: "Pristina", country: "Kosovo", timezone: "Europe/Belgrade" },

    { city: "Tallinn", country: "Estonia", timezone: "Europe/Tallinn" },
    { city: "Riga", country: "Latvia", timezone: "Europe/Riga" },
    { city: "Vilnius", country: "Lithuania", timezone: "Europe/Vilnius" },
    { city: "Chisinau", country: "Moldova", timezone: "Europe/Chisinau", aliases: ["Chișinău"] },

    // ============================================
    // MIDDLE EAST
    // ============================================
    { city: "Dubai", country: "UAE", timezone: "Asia/Dubai" },
    { city: "Abu Dhabi", country: "UAE", timezone: "Asia/Dubai" },
    { city: "Sharjah", country: "UAE", timezone: "Asia/Dubai" },

    { city: "Tel Aviv", country: "Israel", timezone: "Asia/Jerusalem" },
    { city: "Jerusalem", country: "Israel", timezone: "Asia/Jerusalem" },
    { city: "Haifa", country: "Israel", timezone: "Asia/Jerusalem" },

    { city: "Istanbul", country: "Turkey", timezone: "Europe/Istanbul" },
    { city: "Ankara", country: "Turkey", timezone: "Europe/Istanbul" },
    { city: "Izmir", country: "Turkey", timezone: "Europe/Istanbul" },
    { city: "Antalya", country: "Turkey", timezone: "Europe/Istanbul" },
    { city: "Bursa", country: "Turkey", timezone: "Europe/Istanbul" },

    { city: "Riyadh", country: "Saudi Arabia", timezone: "Asia/Riyadh" },
    { city: "Jeddah", country: "Saudi Arabia", timezone: "Asia/Riyadh" },
    { city: "Mecca", country: "Saudi Arabia", timezone: "Asia/Riyadh", aliases: ["Makkah"] },
    { city: "Medina", country: "Saudi Arabia", timezone: "Asia/Riyadh" },

    { city: "Doha", country: "Qatar", timezone: "Asia/Qatar" },
    { city: "Kuwait City", country: "Kuwait", timezone: "Asia/Kuwait" },
    { city: "Manama", country: "Bahrain", timezone: "Asia/Bahrain" },
    { city: "Muscat", country: "Oman", timezone: "Asia/Muscat" },

    { city: "Tehran", country: "Iran", timezone: "Asia/Tehran" },
    { city: "Mashhad", country: "Iran", timezone: "Asia/Tehran" },
    { city: "Isfahan", country: "Iran", timezone: "Asia/Tehran" },

    { city: "Baghdad", country: "Iraq", timezone: "Asia/Baghdad" },
    { city: "Erbil", country: "Iraq", timezone: "Asia/Baghdad" },

    { city: "Amman", country: "Jordan", timezone: "Asia/Amman" },
    { city: "Beirut", country: "Lebanon", timezone: "Asia/Beirut" },
    { city: "Damascus", country: "Syria", timezone: "Asia/Damascus" },

    { city: "Nicosia", country: "Cyprus", timezone: "Asia/Nicosia" },
    { city: "Baku", country: "Azerbaijan", timezone: "Asia/Baku" },
    { city: "Tbilisi", country: "Georgia", timezone: "Asia/Tbilisi" },
    { city: "Yerevan", country: "Armenia", timezone: "Asia/Yerevan" },

    // ============================================
    // CENTRAL ASIA
    // ============================================
    { city: "Almaty", country: "Kazakhstan", timezone: "Asia/Almaty" },
    { city: "Nur-Sultan", country: "Kazakhstan", timezone: "Asia/Almaty", aliases: ["Astana"] },
    { city: "Tashkent", country: "Uzbekistan", timezone: "Asia/Tashkent" },
    { city: "Bishkek", country: "Kyrgyzstan", timezone: "Asia/Bishkek" },
    { city: "Dushanbe", country: "Tajikistan", timezone: "Asia/Dushanbe" },
    { city: "Ashgabat", country: "Turkmenistan", timezone: "Asia/Ashgabat" },

    // ============================================
    // SOUTH ASIA
    // ============================================
    { city: "Mumbai", country: "India", timezone: "Asia/Kolkata", aliases: ["Bombay"] },
    { city: "Delhi", country: "India", timezone: "Asia/Kolkata", aliases: ["New Delhi"] },
    { city: "Bangalore", country: "India", timezone: "Asia/Kolkata", aliases: ["Bengaluru"] },
    { city: "Hyderabad", country: "India", timezone: "Asia/Kolkata" },
    { city: "Chennai", country: "India", timezone: "Asia/Kolkata", aliases: ["Madras"] },
    { city: "Kolkata", country: "India", timezone: "Asia/Kolkata", aliases: ["Calcutta"] },
    { city: "Pune", country: "India", timezone: "Asia/Kolkata" },
    { city: "Ahmedabad", country: "India", timezone: "Asia/Kolkata" },
    { city: "Jaipur", country: "India", timezone: "Asia/Kolkata" },
    { city: "Lucknow", country: "India", timezone: "Asia/Kolkata" },
    { city: "Chandigarh", country: "India", timezone: "Asia/Kolkata" },
    { city: "Goa", country: "India", timezone: "Asia/Kolkata" },

    { city: "Karachi", country: "Pakistan", timezone: "Asia/Karachi" },
    { city: "Lahore", country: "Pakistan", timezone: "Asia/Karachi" },
    { city: "Islamabad", country: "Pakistan", timezone: "Asia/Karachi" },
    { city: "Rawalpindi", country: "Pakistan", timezone: "Asia/Karachi" },

    { city: "Dhaka", country: "Bangladesh", timezone: "Asia/Dhaka" },
    { city: "Chittagong", country: "Bangladesh", timezone: "Asia/Dhaka" },

    { city: "Colombo", country: "Sri Lanka", timezone: "Asia/Colombo" },
    { city: "Kathmandu", country: "Nepal", timezone: "Asia/Kathmandu" },
    { city: "Thimphu", country: "Bhutan", timezone: "Asia/Thimphu" },
    { city: "Male", country: "Maldives", timezone: "Indian/Maldives", aliases: ["Malé"] },

    // ============================================
    // SOUTHEAST ASIA
    // ============================================
    { city: "Singapore", country: "Singapore", timezone: "Asia/Singapore" },

    { city: "Bangkok", country: "Thailand", timezone: "Asia/Bangkok" },
    { city: "Phuket", country: "Thailand", timezone: "Asia/Bangkok" },
    { city: "Chiang Mai", country: "Thailand", timezone: "Asia/Bangkok" },

    { city: "Kuala Lumpur", country: "Malaysia", timezone: "Asia/Kuala_Lumpur", aliases: ["KL"] },
    { city: "Penang", country: "Malaysia", timezone: "Asia/Kuala_Lumpur" },
    { city: "Johor Bahru", country: "Malaysia", timezone: "Asia/Kuala_Lumpur" },

    { city: "Jakarta", country: "Indonesia", timezone: "Asia/Jakarta" },
    { city: "Surabaya", country: "Indonesia", timezone: "Asia/Jakarta" },
    { city: "Bandung", country: "Indonesia", timezone: "Asia/Jakarta" },
    { city: "Bali", country: "Indonesia", timezone: "Asia/Makassar", aliases: ["Denpasar"] },
    { city: "Medan", country: "Indonesia", timezone: "Asia/Jakarta" },

    { city: "Manila", country: "Philippines", timezone: "Asia/Manila" },
    { city: "Cebu", country: "Philippines", timezone: "Asia/Manila" },
    { city: "Davao", country: "Philippines", timezone: "Asia/Manila" },

    { city: "Ho Chi Minh City", country: "Vietnam", timezone: "Asia/Ho_Chi_Minh", aliases: ["Saigon", "HCMC"] },
    { city: "Hanoi", country: "Vietnam", timezone: "Asia/Ho_Chi_Minh" },
    { city: "Da Nang", country: "Vietnam", timezone: "Asia/Ho_Chi_Minh" },

    { city: "Phnom Penh", country: "Cambodia", timezone: "Asia/Phnom_Penh" },
    { city: "Siem Reap", country: "Cambodia", timezone: "Asia/Phnom_Penh" },

    { city: "Yangon", country: "Myanmar", timezone: "Asia/Yangon", aliases: ["Rangoon"] },
    { city: "Vientiane", country: "Laos", timezone: "Asia/Vientiane" },
    { city: "Bandar Seri Begawan", country: "Brunei", timezone: "Asia/Brunei" },
    { city: "Dili", country: "Timor-Leste", timezone: "Asia/Dili" },

    // ============================================
    // EAST ASIA
    // ============================================
    { city: "Tokyo", country: "Japan", timezone: "Asia/Tokyo" },
    { city: "Osaka", country: "Japan", timezone: "Asia/Tokyo" },
    { city: "Kyoto", country: "Japan", timezone: "Asia/Tokyo" },
    { city: "Yokohama", country: "Japan", timezone: "Asia/Tokyo" },
    { city: "Nagoya", country: "Japan", timezone: "Asia/Tokyo" },
    { city: "Sapporo", country: "Japan", timezone: "Asia/Tokyo" },
    { city: "Fukuoka", country: "Japan", timezone: "Asia/Tokyo" },
    { city: "Kobe", country: "Japan", timezone: "Asia/Tokyo" },
    { city: "Hiroshima", country: "Japan", timezone: "Asia/Tokyo" },

    { city: "Seoul", country: "South Korea", timezone: "Asia/Seoul" },
    { city: "Busan", country: "South Korea", timezone: "Asia/Seoul" },
    { city: "Incheon", country: "South Korea", timezone: "Asia/Seoul" },
    { city: "Daegu", country: "South Korea", timezone: "Asia/Seoul" },

    { city: "Beijing", country: "China", timezone: "Asia/Shanghai", aliases: ["Peking"] },
    { city: "Shanghai", country: "China", timezone: "Asia/Shanghai" },
    { city: "Shenzhen", country: "China", timezone: "Asia/Shanghai" },
    { city: "Guangzhou", country: "China", timezone: "Asia/Shanghai", aliases: ["Canton"] },
    { city: "Hong Kong", country: "China", timezone: "Asia/Hong_Kong", aliases: ["HK"] },
    { city: "Chengdu", country: "China", timezone: "Asia/Shanghai" },
    { city: "Xi'an", country: "China", timezone: "Asia/Shanghai", aliases: ["Xian"] },
    { city: "Hangzhou", country: "China", timezone: "Asia/Shanghai" },
    { city: "Nanjing", country: "China", timezone: "Asia/Shanghai" },
    { city: "Wuhan", country: "China", timezone: "Asia/Shanghai" },
    { city: "Chongqing", country: "China", timezone: "Asia/Shanghai" },
    { city: "Tianjin", country: "China", timezone: "Asia/Shanghai" },
    { city: "Suzhou", country: "China", timezone: "Asia/Shanghai" },
    { city: "Qingdao", country: "China", timezone: "Asia/Shanghai" },
    { city: "Macau", country: "China", timezone: "Asia/Macau", aliases: ["Macao"] },

    { city: "Taipei", country: "Taiwan", timezone: "Asia/Taipei" },
    { city: "Kaohsiung", country: "Taiwan", timezone: "Asia/Taipei" },

    { city: "Ulaanbaatar", country: "Mongolia", timezone: "Asia/Ulaanbaatar" },
    { city: "Pyongyang", country: "North Korea", timezone: "Asia/Pyongyang" },

    // ============================================
    // AFRICA
    // ============================================
    { city: "Cairo", country: "Egypt", timezone: "Africa/Cairo" },
    { city: "Alexandria", country: "Egypt", timezone: "Africa/Cairo" },
    { city: "Giza", country: "Egypt", timezone: "Africa/Cairo" },

    { city: "Lagos", country: "Nigeria", timezone: "Africa/Lagos" },
    { city: "Abuja", country: "Nigeria", timezone: "Africa/Lagos" },
    { city: "Kano", country: "Nigeria", timezone: "Africa/Lagos" },

    { city: "Johannesburg", country: "South Africa", timezone: "Africa/Johannesburg", aliases: ["Joburg"] },
    { city: "Cape Town", country: "South Africa", timezone: "Africa/Johannesburg" },
    { city: "Durban", country: "South Africa", timezone: "Africa/Johannesburg" },
    { city: "Pretoria", country: "South Africa", timezone: "Africa/Johannesburg" },

    { city: "Nairobi", country: "Kenya", timezone: "Africa/Nairobi" },
    { city: "Mombasa", country: "Kenya", timezone: "Africa/Nairobi" },

    { city: "Casablanca", country: "Morocco", timezone: "Africa/Casablanca" },
    { city: "Marrakech", country: "Morocco", timezone: "Africa/Casablanca" },
    { city: "Rabat", country: "Morocco", timezone: "Africa/Casablanca" },
    { city: "Fes", country: "Morocco", timezone: "Africa/Casablanca", aliases: ["Fez"] },
    { city: "Tangier", country: "Morocco", timezone: "Africa/Casablanca" },

    { city: "Algiers", country: "Algeria", timezone: "Africa/Algiers" },
    { city: "Tunis", country: "Tunisia", timezone: "Africa/Tunis" },
    { city: "Tripoli", country: "Libya", timezone: "Africa/Tripoli" },

    { city: "Accra", country: "Ghana", timezone: "Africa/Accra" },
    { city: "Addis Ababa", country: "Ethiopia", timezone: "Africa/Addis_Ababa" },
    { city: "Dar es Salaam", country: "Tanzania", timezone: "Africa/Dar_es_Salaam" },
    { city: "Kampala", country: "Uganda", timezone: "Africa/Kampala" },
    { city: "Kigali", country: "Rwanda", timezone: "Africa/Kigali" },
    { city: "Kinshasa", country: "DR Congo", timezone: "Africa/Kinshasa" },
    { city: "Luanda", country: "Angola", timezone: "Africa/Luanda" },
    { city: "Maputo", country: "Mozambique", timezone: "Africa/Maputo" },
    { city: "Lusaka", country: "Zambia", timezone: "Africa/Lusaka" },
    { city: "Harare", country: "Zimbabwe", timezone: "Africa/Harare" },
    { city: "Windhoek", country: "Namibia", timezone: "Africa/Windhoek" },
    { city: "Gaborone", country: "Botswana", timezone: "Africa/Gaborone" },
    { city: "Dakar", country: "Senegal", timezone: "Africa/Dakar" },
    { city: "Abidjan", country: "Ivory Coast", timezone: "Africa/Abidjan" },
    { city: "Douala", country: "Cameroon", timezone: "Africa/Douala" },
    { city: "Yaounde", country: "Cameroon", timezone: "Africa/Douala", aliases: ["Yaoundé"] },
    { city: "Bamako", country: "Mali", timezone: "Africa/Bamako" },
    { city: "Ouagadougou", country: "Burkina Faso", timezone: "Africa/Ouagadougou" },
    { city: "Conakry", country: "Guinea", timezone: "Africa/Conakry" },
    { city: "Freetown", country: "Sierra Leone", timezone: "Africa/Freetown" },
    { city: "Monrovia", country: "Liberia", timezone: "Africa/Monrovia" },
    { city: "Lome", country: "Togo", timezone: "Africa/Lome", aliases: ["Lomé"] },
    { city: "Cotonou", country: "Benin", timezone: "Africa/Porto-Novo" },
    { city: "Niamey", country: "Niger", timezone: "Africa/Niamey" },
    { city: "N'Djamena", country: "Chad", timezone: "Africa/Ndjamena" },
    { city: "Khartoum", country: "Sudan", timezone: "Africa/Khartoum" },
    { city: "Mogadishu", country: "Somalia", timezone: "Africa/Mogadishu" },
    { city: "Asmara", country: "Eritrea", timezone: "Africa/Asmara" },
    { city: "Djibouti", country: "Djibouti", timezone: "Africa/Djibouti" },
    { city: "Port Louis", country: "Mauritius", timezone: "Indian/Mauritius" },
    { city: "Antananarivo", country: "Madagascar", timezone: "Indian/Antananarivo" },

    // ============================================
    // OCEANIA
    // ============================================
    { city: "Sydney", country: "Australia", timezone: "Australia/Sydney" },
    { city: "Melbourne", country: "Australia", timezone: "Australia/Melbourne" },
    { city: "Brisbane", country: "Australia", timezone: "Australia/Brisbane" },
    { city: "Perth", country: "Australia", timezone: "Australia/Perth" },
    { city: "Adelaide", country: "Australia", timezone: "Australia/Adelaide" },
    { city: "Gold Coast", country: "Australia", timezone: "Australia/Brisbane" },
    { city: "Canberra", country: "Australia", timezone: "Australia/Sydney" },
    { city: "Hobart", country: "Australia", timezone: "Australia/Hobart" },
    { city: "Darwin", country: "Australia", timezone: "Australia/Darwin" },
    { city: "Cairns", country: "Australia", timezone: "Australia/Brisbane" },

    { city: "Auckland", country: "New Zealand", timezone: "Pacific/Auckland" },
    { city: "Wellington", country: "New Zealand", timezone: "Pacific/Auckland" },
    { city: "Christchurch", country: "New Zealand", timezone: "Pacific/Auckland" },
    { city: "Hamilton", country: "New Zealand", timezone: "Pacific/Auckland" },
    { city: "Queenstown", country: "New Zealand", timezone: "Pacific/Auckland" },

    { city: "Fiji", country: "Fiji", timezone: "Pacific/Fiji", aliases: ["Suva"] },
    { city: "Port Moresby", country: "Papua New Guinea", timezone: "Pacific/Port_Moresby" },
    { city: "Noumea", country: "New Caledonia", timezone: "Pacific/Noumea", aliases: ["Nouméa"] },
    { city: "Papeete", country: "French Polynesia", timezone: "Pacific/Tahiti", aliases: ["Tahiti"] },
    { city: "Guam", country: "Guam", timezone: "Pacific/Guam" },
    { city: "Apia", country: "Samoa", timezone: "Pacific/Apia" },
    { city: "Nuku'alofa", country: "Tonga", timezone: "Pacific/Tongatapu" },
    { city: "Port Vila", country: "Vanuatu", timezone: "Pacific/Efate" },
]

// Create a search index for faster lookups
export function searchCities(query: string): CityEntry[] {
    const normalizedQuery = query.toLowerCase().trim()
    if (!normalizedQuery) return []

    return CITY_TIMEZONES.filter(entry => {
        // Search city name
        if (entry.city.toLowerCase().includes(normalizedQuery)) return true
        // Search country
        if (entry.country.toLowerCase().includes(normalizedQuery)) return true
        // Search aliases
        if (entry.aliases?.some(alias => alias.toLowerCase().includes(normalizedQuery))) return true
        return false
    })
}

// Format city entry for display
export function formatCityEntry(entry: CityEntry): string {
    return `${entry.city}, ${entry.country}`
}
