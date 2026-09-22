// Photo numbers refer to IMG-20260921-WAxxxx.jpg. Prices are intentionally not inferred.
export const photoCategories = [
  ['snacks','Snacks & Namkeen',133,'Chips, popcorn and savoury favourites','স্ন্যাক্স ও চিপস','स्नैक्स और नमकीन'],
  ['biscuits-cakes','Biscuits & Cakes',175,'Tea-time biscuits, cookies, cakes and rusks','বিস্কুট ও কেক','बिस्कुट और केक'],
  ['beverages','Drinks & Beverages',34,'Soft drinks, fruit drinks, lassi and coffee','পানীয় ও কোল্ড ড্রিঙ্কস','पेय और कोल्ड ड्रिंक्स'],
  ['spices-grocery','Spices & Grocery',108,'Whole spices, masalas and pantry essentials','মশলা ও মুদিখানা','मसाले और किराना'],
  ['chocolates-sweets','Chocolates & Sweets',159,'Chocolate, candy and traditional sweets','চকলেট ও মিষ্টি','चॉकलेट और मिठाई'],
  ['stationery','Stationery & School',94,'Pens, art supplies and school essentials','স্টেশনারি ও স্কুল সামগ্রী','स्टेशनरी और स्कूल'],
  ['home-care','Home & Laundry Care',222,'Laundry products and room fresheners','হোম ও লন্ড্রি কেয়ার','होम और लॉन्ड्री केयर'],
  ['personal-care','Personal Care',119,'Handwash, fragrances and everyday care','পার্সোনাল কেয়ার','पर्सनल केयर'],
].map(([slug,name,photo,shortDesc,bengaliName,hindiName])=>({id:'photo-'+slug,slug,name,bengaliName,hindiName,shortDesc,tagline:shortDesc,image:photoPath(photo),subcategories:[],iconName:'ShoppingBag',bannerGradient:'from-emerald-700 to-teal-800'}));
export function photoPath(n){return '/assets/products/IMG-20260921-WA'+String(n).padStart(4,'0')+'.jpg';}
const groups = {
'spices-grocery': `0|Whole spice assortment
2|Rose buds and whole spice mix
3|Whole spice mix - tub
5|Whole garam masala mix
13|Everest Garam Masala
14|Catch Ginger Garlic Paste
15|Everest Black Pepper Powder
16,107|Whole spice mix - jar
17|Sunrise Pure Shahi Garam Masala
108|Everest Chhole Masala
109|Sunrise Chicken Curry Masala
111|Sunrise Kashmiri Mirch
112|Sunrise Meat Masala
113|Sunrise Jeera Powder
114|Sunrise Lal Mirch Powder
122|Everest Turmeric Powder
134|Blue Dragon Hakka Veg Chow
144|PRAN Utshob Vermicelli
152|Kissan Mango Jam
153|Kissan Pineapple Jam
233|Cookme Turmeric Powder
238|Whole cumin seeds`,
'beverages': `23|Aashirvaad Strawberry Lassi
24|Mango fruit drink
25|Campa Energy Mixed Fruit
26|Campa Jeera Up
27|Fizzy soft drink - black bottle
28|Campa Lemon Lime
29|Electrorush Orange Drink
30|Independence Packaged Drinking Water
31|Campa Orange
32|PRAN Litchi Drink
33|Chutki Lemon Drink - green bottle
34|Campa Cola
35|Chutki Lemon Drink - clear bottle
36|Aashirvaad Mango Lassi
37|Sun Crush Fruit Drink
38|Britannia Winkin Cow Bourbon Milkshake
39|Rasik Mango Drink
68|Frooti Mango Drink
225|Nescafe Classic Coffee Sachet`,
'stationery': `18|DOMS Drawing Book - yellow cover
19|DOMS Drawing Book - green cover
20|DOMS Modelling Clay
21|DOMS Batman Stationery Kit
22|DOMS E-Racer Eraser
40|Luxor Permanent Marker - blue
41|Pentonic G-RT Gel Pens
42|Hyper Erasers
43|Red and Black Pencil
44|Panda Writing Board
45|Princess Pencil Box
46|Polo Oil Pastels - compact pack
47|Polo Oil Pastels - assorted pack
48|Polo Oil Pastels - starter pack
49|Adhesive Tape Roll
50|Novelty Eraser Set
51|Camlin Oil Pastels
52|Luxor Permanent Marker - black
53|Luxor Sunny Pens
54|Space Pencil Pouch
55,85|Rorito Jottek Pens
56|Elkos Riso Ball Pens
57,75|Blue Ball Pen
58|Black Ball Pen
59|Pink Pen
60|Light Blue Pen
61|Luxor Blue Marker
62|Shinchan Keyring
63|Character Keyring with Strap
64|Kangaro Hole Punch - medium
65|Kangaro Hole Punch - compact
66|Kangaro Hole Punch - mini
67|Kangaro DP-600 Hole Punch
69|Kangaro 24/6 Staples
70|Kangaro Stapler - silver
71|Kangaro Stapler - black
72|Kangaro No. 10 Staples
73|DOMS Zoom HB Pencil
74|Elkos Cartoon Pen
76|Fevikwik Instant Adhesive - pouch
77,78|Princess Transparent Pencil Pouch
79|Fevikwik Instant Adhesive - small tube
80|Fevikwik Instant Adhesive - large tube
81|Snoopy Writing Board
82|Black and White Patterned Pencil
83|Luxor Pink Pens
84|Luxor Pen Set
86|Elkos Mentor Gel Pens
87|Fevistick Glue Stick - small
88|Fevistick Glue Stick - large
89|Fevigum - yellow bottle
90|Dreams Writing Board - purple
91|Cartoon Writing Board - brown
92|Fevigum - blue bottle
93|DOMS Oil Pastels
94|DOMS Geofine Geometry Box
95|DOMS GripPop Plastic Crayons
96|DOMS Geomiti Geometry Box
97|DOMS Stationery Gift Set
98|DOMS Dust Free Eraser
99|DOMS Colouring Set
100|Elkos Click Ball Pens
101|Transparent Ruler
102|DOMS Neon Erasers
103|Elkos Willy Pens
104|Winnie the Pooh Pencil Box
105|Fevicol MR General Purpose Glue
106|DOMS Stationery Gift Bag`,
'snacks': `120|POPZ Cookies and Creme
121|Pringles Desi Masala Tadka
123|POPZ Hazelnut Crunch
124|POPZ Chocolate Crunch
129|Prabhuji All in One Mixture
130|Pringles Red Hot Chilli
131|Kurkure Masala Munch
132|Prabhuji Bhujia
133|Lay's Classic Salted Chips
135|New Babuana Namkeen - red pack
137|Puja Chanachur
138|Crunchy Chat Snack
139|New Babuana Namkeen - green pack
140|ACT II Popcorn - super saver pack
141|ACT II Butter Popcorn
226|Lay's American Style Cream and Onion
227|Lay's West Indies Hot and Sweet Chilli
231|ACT II Popcorn - Classic Salted
232|ACT II Popcorn - Golden Sizzle`,
'chocolates-sweets': `115|Cadbury Dairy Milk Silk Lolly
116,118|Cadbury Dairy Milk Shots
117|Pass Pass Pulse Kachcha Aam Candy
145,215|Prabhuji Soan Papdi
146|Soan Papdi - yellow pack
147|Chocolate Eclair Candy
148|Nestle KitKat
157|Alpenliebe Gold Candy
158|Alpenliebe Lollipop
159|Cadbury Gems
172|Cadbury Celebrations - purple gift box
173|Cadbury Celebrations - orange gift box
236|Chupa Chups Bubble Gum
237|Hajmola Maha Candy Chulbuli Imli`,
'personal-care': `119|Savlon Moisture Shield Handwash Refill
149|Bella Vita White Oud Fragrance
150|Denver Deodorant
151|Bella Vita Glam Woman Fragrance
164|Savlon Powder Handwash
165|Dettol Powder Handwash
216|Savlon Moisture Shield Handwash Combo`,
'home-care': `125,168|Ariel Power Gel Refill
126,222|Ariel Power Gel Bottle
127|Ariel Perfect Wash Detergent - small pack
128|Tide Lemon and Mint Detergent
154,219|Sunlight Detergent Powder
155|Magic XL Detergent Powder - value pack
156,218|Magic XL Detergent Powder - floral pack
167|Magic XL Detergent Powder - small pack
183|Ambi Pur Room Fresh Gel - lavender
184|Ambi Pur Room Fresh Gel - green
185|Ambi Pur Air Freshener - lavender
186|Ambi Pur Air Freshener - rose
187|Ambi Pur Room Fresh Gel - floral
209|Ambi Pur Air Freshener - blue
210|Ambi Pur Room Fresh Gel - rose
220|Tide Double Power Jasmine and Rose
221|Surf Excel Matic Liquid
223|Ariel Complete Detergent Powder`,
'biscuits-cakes': `110,191|Sunfeast Marie Light Biscuits
136|Parle Marie Biscuits
142|Britannia Gobbles Cake - green pack
143|Britannia Gobbles Cake - fruit
160|Ziggy Choco Vanilla Donut Cake
161|Sunfeast Cakes All Good - fruit
162,206|PRAN Dry Cake
163|PRAN Cupcake
166|Sunfeast Cakes All Good - chocolate
169|PRAN Toast Baby Rusk
170|PRAN Toast Family Rusk
171|Tea Break Rusk
174|Sunfeast Dark Fantasy Vanilla Creme
175|Britannia Good Day Cashew Cookies
176|Britannia Marie Gold Plus
177|Britannia 50-50 Cheeze Dipped
178,208|Horlicks Biscuits
179|Britannia Tiger Krunch
180,182|Britannia Nutri Choice Digestive
181|Britannia Bourbon
188|Parle Happy Happy Cookies
189|Sunfeast Mom's Magic Cashew and Almond - long pack
190|Sunfeast Mom's Magic Butter - long pack
192|Sunfeast Bounce Orange
193|Malikist Sugar Crackers
194,199|PRAN Butter Delight
195,198|Sunfeast Mom's Magic Cashew and Almond - small pack
196|Sunfeast Mom's Magic Butter - small pack
197|Cadbury Oreo Original
200|Sunfeast Dark Fantasy Choco Fills - small pack
201|Sunfeast Bounce Chocolate
202|Sunfeast Dark Fantasy Bourbon
207|PRAN Fit Crackers
211|Britannia Toastea Rusk
212|Britannia 50-50 Top Butter
213|Britannia Good Day Butter Cookies
214|Sunfeast Dark Fantasy Chocolate Creme
217|Ziggy Choco Star Cake
224|Lotte Choco Pie
228|Britannia Gobbles Cake - milk
229|Britannia Gobbles Cake - orange
230|Britannia Gobbles Cake - butter
234|Britannia Treat Croissant Cocoa
235|Britannia Little Hearts`,
};
export const photoProducts = Object.entries(groups).flatMap(([category,lines])=>lines.split('\n').map(line=>{
  const [numbers,name]=line.split('|'), photos=numbers.split(',').map(Number);
  return {id:'photo-'+String(photos[0]).padStart(4,'0'),name,category,subcategory:'',weight:'',image:photoPath(photos[0]),images:photos.map(photoPath),price:0,oldPrice:0,stock:0,pricePending:true,description:`${name}. Check the product label for the exact pack size, ingredients or materials, usage instructions and expiry information where applicable.`,source:'local-photos-20260921'};
}));
// WA0203–0205 are category screenshots, not sellable products.
