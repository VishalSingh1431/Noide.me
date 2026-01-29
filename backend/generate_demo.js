import fs from 'fs';
import { generateBusinessHTML } from './views/businessTemplate.js';

const mockBusiness = {
    id: 123,
    userId: 1,
    businessName: "Elite Fitness Varanasi",
    category: "Gym",
    ownerName: "Abhishek Singh",
    description: "Experience the ultimate fitness transformation at Elite Fitness Varanasi. Our state-of-the-art facility combines modern equipment with expert guidance to help you reach your goals. From high-intensity training to restorative yoga, we offer a comprehensive approach to health and wellness in the heart of the holy city.",
    address: "B 20/45, Assi Ghat Road, Near Assi Ghat, Varanasi, Uttar Pradesh 221005",
    mobile: "+91 98765 43210",
    email: "contact@elitefitnessvns.com",
    logoUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop",
    slug: "elite-fitness-varanasi",
    theme: "modern",
    navbarTagline: "Elevate Your Strength",
    whatsapp: "919876543210",
    imagesUrl: [
        "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1558611848-73f7eb4001a1?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=2070&auto=format&fit=crop"
    ],
    services: [
        {
            title: "Strength Training",
            description: "Personalized weightlifting programs designed to build lean muscle and increase metabolic rate.",
            price: "2499",
            imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=2070&auto=format&fit=crop",
            featured: true
        },
        {
            title: "Yoga & Mindfulness",
            description: "Guided sessions focusing on flexibility, core strength, and mental clarity with expert instructors.",
            price: "1499",
            imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2070&auto=format&fit=crop"
        },
        {
            title: "Nutritional Coaching",
            description: "Customized meal plans and dietary advice to complement your physical training and accelerate results.",
            price: "999",
            imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2070&auto=format&fit=crop"
        }
    ],
    amenities: ["State-of-the-art Equipment", "Certified Trainers", "Luxury Showers", "Free WiFi", "Protein Bar"],
    paymentMethods: ["UPI", "Cash", "Card", "Cheque"],
    parkingInfo: ["Dedicated Car Parking", "Two-Wheeler Space"],
    businessHours: {
        monday: { open: true, start: "06:00", end: "22:00" },
        tuesday: { open: true, start: "06:00", end: "22:00" },
        wednesday: { open: true, start: "06:00", end: "22:00" },
        thursday: { open: true, start: "06:00", end: "22:00" },
        friday: { open: true, start: "06:00", end: "22:00" },
        saturday: { open: true, start: "07:00", end: "20:00" },
        sunday: { open: true, start: "08:00", end: "12:00" }
    },
    reviews: [
        { name: "Vikram Mehta", rating: 5, comment: "Best gym in Varanasi! The equipment is world-class and the vibe is super motivating. I've been training here for six months and the transformation is incredible.", date: "1 week ago" },
        { name: "Anjali Gupta", rating: 5, comment: "Love the yoga sessions. The trainers are very professional and helpful. The environment is peaceful yet energizing. Highly recommended for beginners!", date: "2 weeks ago" },
        { name: "Rajesh Kumar", rating: 5, comment: "Premium facility with great amenities. The protein bar is a nice touch. Top notch trainers who actually care about your progress.", date: "1 month ago" }
    ],
    faqs: [
        { question: "What are your membership plans?", answer: "We offer monthly, quarterly, and annual membership plans starting at ₹2499. Student discounts are available." },
        { question: "Do you have personal trainers?", answer: "Yes, we have a team of certified personal trainers available for one-on-one sessions tailored to your fitness goals." },
        { question: "Is there enough parking space?", answer: "We have dedicated basement parking for cars and separate slots for two-wheelers for all our members." }
    ],
    mapLink: "https://www.google.com/maps/place/Assi+Ghat/@25.2890,83.0068",
    ecommerceEnabled: true
};

const html = generateBusinessHTML(mockBusiness, "http://localhost:50002/api");
fs.writeFileSync('demo_website.html', html);
console.log("Demo website generated: demo_website.html");
