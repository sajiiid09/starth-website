import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowSquareOut } from "@phosphor-icons/react";

const vendorPartners = [
  { name: "1st Phorm", url: "https://1stphorm.sjv.io/c/5980041/3062647/37436", category: "Sports Apparel" },
  { name: "8000Kicks", url: "https://8000kicks.sjv.io/c/5980041/3359384/44202", category: "Footwear" },
  { name: "Abbott Lingo", url: "https://abbottlingo.sjv.io/c/5980041/2011025/24869", category: "Health Tech" },
  { name: "ACEBEAM", url: "https://acebeamflashlight.sjv.io/c/5980041/1685780/19551", category: "Lighting" },
  { name: "Aligrace Hair", url: "#", category: "Beauty" },
  { name: "AlphaStyle", url: "https://multicoinsindustriallimited.sjv.io/c/5980041/3269875/418", category: "Fashion" },
  { name: "Amotopart", url: "#", category: "Auto Parts" },
  { name: "Andy & Evan", url: "https://andyevan.sjv.io/c/5980041/2071348/25955", category: "Children's Apparel" },
  { name: "Angelbliss", url: "https://angelbliss.pxf.io/c/5980041/1745569/20350", category: "Baby Products" },
  { name: "AOFIT", url: "#", category: "Fitness" },
  { name: "Arkuda Digital", url: "#", category: "Digital Services" },
  { name: "Aspen Brands", url: "#", category: "Consumer Goods" },
  { name: "atoms", url: "#", category: "Footwear" },
  { name: "Baby Gold", url: "#", category: "Baby Products" },
  { name: "Best Choice Products", url: "https://bestchoiceproducts.sjv.io/c/5980041/2873487/33479", category: "Furniture & Decor" },
  { name: "BistroMD", url: "#", category: "Meal Delivery" },
  { name: "Blanka", url: "https://blanka.sjv.io/c/5980041/1904411/22804", category: "Beauty & Fashion" },
  { name: "Bluehost", url: "https://bluehost.sjv.io/c/5980041/795082/11352", category: "Web Hosting" },
  { name: "Brother USA", url: "https://brother.pxf.io/c/5980041/1546073/18036", category: "Electronics" },
  { name: "Burke Decor", url: "https://burkedecor.sjv.io/c/5980041/1766818/20791", category: "Home Decor" },
  { name: "Bytedance", url: "#", category: "Technology" },
  { name: "Callie EU", url: "#", category: "Fashion" },
  { name: "CBD For Life", url: "#", category: "Wellness" },
  { name: "Cellresearch", url: "#", category: "Health" },
  { name: "Cerebelly", url: "https://cerebelly.sjv.io/c/5980041/1487650/17551", category: "Baby Food" },
  { name: "CHICV", url: "#", category: "Fashion" },
  { name: "Cleanster", url: "https://cleansterinc.sjv.io/c/5980041/2177883/28000", category: "Cleaning Services" },
  { name: "Coffee Bros", url: "https://coffeebros.sjv.io/c/5980041/1574164/18282", category: "Coffee" },
  { name: "Contrail", url: "#", category: "Technology" },
  { name: "Cowinaudio", url: "#", category: "Audio Equipment" },
  { name: "DESIGNME Hair", url: "#", category: "Beauty" },
  { name: "Digitrading", url: "#", category: "Digital Services" },
  { name: "Doba", url: "#", category: "E-commerce" },
  { name: "DocuSign", url: "https://docusign.pxf.io/c/5980041/1679366/19450", category: "Digital Signatures" },
  { name: "Dreamworld Research", url: "#", category: "Research" },
  { name: "DrTalks", url: "https://drtalks.pxf.io/c/5980041/2013193/24899", category: "Health Education" },
  { name: "Dymocks", url: "#", category: "Books" },
  { name: "Easyship", url: "https://easyship.ilbqy6.net/c/5980041/666308/10435", category: "Shipping" },
  { name: "eat G.A.N.G.S.T.E.R.", url: "#", category: "Food" },
  { name: "eBrands Global", url: "#", category: "Consumer Brands" },
  { name: "EezyBrands", url: "#", category: "Consumer Brands" },
  { name: "Electronicx", url: "#", category: "Electronics" },
  { name: "EMEET", url: "#", category: "Audio/Video" },
  { name: "Epha Medtech", url: "#", category: "Health Tech" },
  { name: "Escalade Sports", url: "#", category: "Sports Equipment" },
  { name: "Esmond Natural", url: "#", category: "Supplements" },
  { name: "Ettika", url: "#", category: "Jewelry" },
  { name: "Everything Kitchens", url: "#", category: "Kitchenware" },
  { name: "EZGO Group", url: "#", category: "Transportation" },
  { name: "Fabula Holdings", url: "#", category: "Investment" },
  { name: "Anker", url: "#", category: "Electronics" },
  { name: "Firmoo", url: "#", category: "Eyewear" },
  { name: "First America Nutrition", url: "#", category: "Supplements" },
  { name: "FitVille", url: "#", category: "Footwear" },
  { name: "Five Iron Golf", url: "#", category: "Golf" },
  { name: "Flying Shark", url: "#", category: "Drones" },
  { name: "Focus Camera", url: "#", category: "Photography" },
  { name: "g4free", url: "#", category: "Outdoor Gear" },
  { name: "Gemini Business", url: "#", category: "Business Services" },
  { name: "Global Widget", url: "#", category: "Widgets" },
  { name: "GODLIKE DIGITAL", url: "#", category: "Digital Marketing" },
  { name: "GOLF le FLEUR*", url: "#", category: "Fashion" },
  { name: "GOLF Partner", url: "#", category: "Golf" },
  { name: "GoMoWorld", url: "#", category: "Travel" },
  { name: "Good Greek Moving", url: "#", category: "Moving Services" },
  { name: "Greatfill", url: "#", category: "Industrial" },
  { name: "GROWNSY", url: "#", category: "Baby Products" },
  { name: "GrowTal", url: "#", category: "Talent Management" },
  { name: "Gyroor", url: "#", category: "Electric Vehicles" },
  { name: "Helium Mobile", url: "#", category: "Telecom" },
  { name: "Helmsman Crystal", url: "#", category: "Luxury Goods" },
  { name: "Homestyler", url: "#", category: "Interior Design" },
  { name: "Hototools", url: "#", category: "Tools" },
  { name: "Inbox Hero", url: "#", category: "Email Management" },
  { name: "Innovative Extracts", url: "#", category: "CBD" },
  { name: "IIN", url: "#", category: "Education" },
  { name: "Intellectia", url: "#", category: "AI Tools" },
  { name: "International Open Academy", url: "#", category: "Online Learning" },
  { name: "InVideo", url: "#", category: "Video Editing" },
  { name: "IPRoyal", url: "#", category: "Proxy Services" },
  { name: "Issyzone", url: "#", category: "Home Goods" },
  { name: "jAlbum", url: "#", category: "Photo Albums" },
  { name: "Kailo", url: "#", category: "Pain Relief" },
  { name: "Kikoff", url: "#", category: "Credit Building" },
  { name: "kingbullbike", url: "#", category: "E-bikes" },
  { name: "KKday", url: "#", category: "Travel Activities" },
  { name: "Lenovo", url: "#", category: "Electronics" },
  { name: "LightInTheBox", url: "#", category: "E-commerce" },
  { name: "Limitless Technology", url: "#", category: "Tech Solutions" },
  { name: "Love & Pebble", url: "#", category: "Pet Products" },
  { name: "Lovevery", url: "#", category: "Baby Toys" },
  { name: "LSTX", url: "#", category: "Audio" },
  { name: "Lumiere", url: "#", category: "Beauty" },
  { name: "Luxury Escapes", url: "#", category: "Travel" },
  { name: "MacPaw", url: "#", category: "Software" },
  { name: "Margovil", url: "#", category: "Fashion" },
  { name: "marketXLS", url: "#", category: "Software" },
  { name: "MARLOWE Skin", url: "#", category: "Men's Grooming" },
  { name: "Martinic", url: "#", category: "Music Software" },
  { name: "Meyer", url: "#", category: "Cookware" },
  { name: "MFI Medical", url: "#", category: "Medical Supplies" },
  { name: "MLILY", url: "#", category: "Mattresses" },
  { name: "Modern AI", url: "#", category: "AI Tools" },
  { name: "Moon Oral Beauty", url: "#", category: "Oral Care" },
  { name: "MOSHIQA", url: "#", category: "Fashion" },
  { name: "Muc-Off", url: "#", category: "Bike Care" },
  { name: "MyDataRemoval", url: "#", category: "Privacy" },
  { name: "MYNEXTBIKE", url: "#", category: "E-bikes" },
  { name: "Naturecan", url: "#", category: "CBD & Wellness" },
  { name: "Next Insurance", url: "#", category: "Insurance" },
  { name: "NicheLife", url: "#", category: "Lifestyle" },
  { name: "Niphean", url: "#", category: "Supplements" },
  { name: "Nobis", url: "#", category: "Outerwear" },
  { name: "NoScrubs Laundry", url: "#", category: "Laundry Service" },
  { name: "OnePlus", url: "#", category: "Smartphones" },
  { name: "Oova", url: "#", category: "Fertility Tech" },
  { name: "Oral B", url: "#", category: "Oral Care" },
  { name: "Packed with Purpose", url: "#", category: "Gifts" },
  { name: "Parallels", url: "#", category: "Software" },
  { name: "Paw.com", url: "#", category: "Pet Products" },
  { name: "Points", url: "#", category: "Loyalty Programs" },
  { name: "Porch Moving Group", url: "#", category: "Moving Services" },
  { name: "PremiumStyle", url: "#", category: "Fashion" },
  { name: "Preply", url: "#", category: "Language Learning" },
  { name: "Printed Mint", url: "#", category: "Stationery" },
  { name: "Prop Money", url: "#", category: "Props" },
  { name: "Reemo Innovation", url: "#", category: "Technology" },
  { name: "ReGlow", url: "#", category: "Skincare" },
  { name: "Rockstar Original", url: "#", category: "Fashion" },
  { name: "Rowabi", url: "#", category: "Home Decor" },
  { name: "SamBoat", url: "#", category: "Boat Rentals" },
  { name: "SAME LOS ANGELES", url: "#", category: "Fashion" },
  { name: "SHAPELLX", url: "#", category: "Shapewear" },
  { name: "Shopify", url: "#", category: "E-commerce Platform" },
  { name: "Simply", url: "#", category: "Music Education" },
  { name: "SimplyWise", url: "#", category: "Finance" },
  { name: "Skylark Connect", url: "#", category: "Connectivity" },
  { name: "Slate Milk", url: "#", category: "Beverages" },
  { name: "Smile Makers", url: "#", category: "Wellness" },
  { name: "Starwood Pet Travel", url: "#", category: "Pet Travel" },
  { name: "Susengo", url: "#", category: "Fashion" },
  { name: "T3 Micro", url: "#", category: "Hair Tools" },
  { name: "Team Whiskey Endures", url: "#", category: "Apparel" },
  { name: "Tend", url: "#", category: "Dental Care" },
  { name: "The Curiosity Box", url: "#", category: "Subscription Box" },
  { name: "The Paisley Box", url: "#", category: "Subscription Box" },
  { name: "The RealReal", url: "#", category: "Luxury Resale" },
  { name: "Thermos", url: "#", category: "Drinkware" },
  { name: "THINKCAR", url: "#", category: "Auto Diagnostics" },
  { name: "Tidio", url: "#", category: "Customer Service" },
  { name: "TikTok Business", url: "#", category: "Marketing" },
  { name: "Tiny Land", url: "#", category: "Kids Furniture" },
  { name: "Toke n Dab", url: "#", category: "Cannabis Accessories" },
  { name: "Token Metrics", url: "#", category: "Crypto Analytics" },
  { name: "UPERFECT", url: "#", category: "Monitors" },
  { name: "Urthbox", url: "#", category: "Snacks" },
  { name: "Valencia Theater Seating", url: "#", category: "Home Theater" },
  { name: "VAVA", url: "#", category: "Electronics" },
  { name: "VEED", url: "#", category: "Video Editing" },
  { name: "VersaDesk", url: "#", category: "Standing Desks" },
  { name: "Vidline", url: "#", category: "Video" },
  { name: "Vista Social", url: "#", category: "Social Media" },
  { name: "W.C. Bradley Co.", url: "#", category: "Outdoor Products" },
  { name: "Water & Wellness", url: "#", category: "Water Filtration" },
  { name: "Waterdropfilter", url: "#", category: "Water Filters" },
  { name: "Wegic", url: "#", category: "AI Web Design" },
  { name: "Whistle", url: "#", category: "Pet Tech" },
  { name: "Wine by Lamborghini", url: "#", category: "Wine" },
  { name: "Wine Express", url: "#", category: "Wine" },
  { name: "wowangel", url: "#", category: "Fashion" },
  { name: "Xendoo", url: "#", category: "Accounting" },
  { name: "YCZ Fragrance", url: "#", category: "Fragrances" },
  { name: "Yok Rith", url: "#", category: "Fashion" },
  { name: "Yonder Media Mobile", url: "#", category: "Mobile Content" },
  { name: "Yum Pup", url: "#", category: "Pet Food" },
  { name: "Zonli", url: "#", category: "Weighted Blankets" }
];

export default function VendorPartners() {
  return (
    <Card className="border-none shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardHeader>
        <CardTitle className="text-2xl">Our Vendor Partners</CardTitle>
        <p className="text-gray-600">Trusted brands and services for your events</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {vendorPartners.map((vendor, index) => (
            <a
              key={index}
              href={vendor.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <div className="p-4 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">
                    {vendor.name}
                  </h3>
                  <ArrowSquareOut className="w-3 h-3 text-gray-400 group-hover:text-indigo-600 flex-shrink-0" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {vendor.category}
                </Badge>
              </div>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}