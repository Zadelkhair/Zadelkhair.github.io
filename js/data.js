const siteData = {
    intro: {
        pretitle: "Hello World",
        title: "I am Zadelkhair Abdelkoddous, a passionate full-stack developer crafting innovative web and mobile solutions.",
        socialLinks: ["LinkedIn", "GitHub", "Twitter", "Instagram"]
    },
    about: {
        info: {
            pretitle: "About",
            text: "Driven full-stack developer with expertise in building robust web applications, mobile solutions, and cloud-based systems. Passionate about solving challenges with clean and efficient code.",
            button: "Download Resume",
            image: {
                src: "images/me2.png",
                srcset: "images/me2.png 1x, images/me2.png 2x"
            }
        },
        expertise: ["Fullstack WEB Development", "Backend/Frontend", "Mobile App Development", "Cloud Integration"],
        timelines: {
            experience: [
                {
                    title: "MIFITHUB",
                    role: "Full-Stack Developer",
                    timeframe: "September 2023 - Present",
                    description: "Collaborated with fitness coach Michaoui Abderrahman to develop an innovative fitness platform, including mobile apps, a website, and a trainer dashboard."
                },
                {
                    title: "Ministry of National Education",
                    role: "IT Teacher",
                    timeframe: "October 2021 - Present",
                    description: "Taught programming, algorithms, and IT fundamentals to high school students while mentoring tech clubs."
                },
                {
                    title: "Alliances",
                    role: "Full-Stack Developer",
                    timeframe: "January 2024 - January 2025",
                    description: "Developed a CRM to improve communication between sales representatives and customers, with features like lead management and property tracking."
                },
                {
                    title: "Multilist",
                    role: "Full-Stack Developer",
                    timeframe: "February 2022 - December 2023",
                    description: "Built a real estate platform with features like map search, ranking systems, and a coin-based ad promotion system."
                },
                {
                    title: "Al-Khayrat",
                    role: "IT Technician",
                    timeframe: "February 2018 - January 2020",
                    description: "Developed a management system and applications to support driving students, while maintaining computer labs and resolving technical issues."
                }
            ],
            education: [
                {
                    title: "University of Mohammed V FS Rabat",
                    degree: "Master of Data Science and Engineering",
                    timeframe: "Expected May 2025",
                    description: "Focused on software development, big data analytics, machine learning, and web development."
                },
                {
                    title: "University Ibn Zohr FP Taroudant",
                    degree: "Bachelor in Computer Science",
                    timeframe: "June 2021",
                    description: "Studied operating systems, programming, database design, and website development."
                }
            ]
        }
    },
    works: [
        {
            category: "Fitness Platform",
            title: "Mifithub",
            image: "images/mifitLogo.png",
            modal: {
                title: "Mifithub",
                description: "A fitness platform with mobile apps, a website, and a trainer dashboard for personalized fitness programs.",
                categories: ["Mobile App", "Web Development"],
                link: "https://www.mifithub.com/"
            },
            swiperImages: [
                "images/slide1.png",
                "images/slide2.png",
                "images/slide3.png",
                "images/slide4.png",
                "images/slide5.png",
            ]
        },
        {
            category: "Real Estate Platform",
            title: "Multilist",
            image: "images/portfolio/multilist.png",
            modal: {
                title: "Multilist",
                description: "A real estate platform with features like map search, ranking systems, and ad promotion.",
                categories: ["Web Development", "UI/UX Design"],
                link: "https://multilist.immo"
            },
            swiperImages: [
                "images/multilist1.png",
                "images/multilist2.png",
                "images/multilist3.png",
                "images/multilist4.png",
            ]
        },
        {
            category: "CRM System",
            title: "Alliances",
            image: "images/portfolio/alliances.png",
            modal: {
                title: "Alliances CRM",
                description: "A CRM system for managing customer communication, lead tracking, and property management.",
                categories: ["Web Development", "Database Management"],
                link: "https://www.alliances.co.ma/"
            },
            swiperImages: [
                "images/alliances.png",
                // "images/alliances2.png"
            ]
        },
        {
            category: "Educational application",
            title: "Alkhayrat",
            image: "images/portfolio/alkhayrat.png",
            modal: {
                title: "Code Alkhayrat",
                description: "Applications (CODE ALKHAYRAT) to support driving students in preparing for the exam (codealkhayrat.com).",
                categories: ["Web Development"],
                link: "https://codealkhayrat.com/test.html?examen"
            },
            swiperImages: [
                "images/alkhayrat1.png",
                "images/alkhayrat2.png",
                "images/alkhayrat3.png",
                "images/alkhayrat4.png",
            ]
        }
    ],
    slidingImages: [
        {
            image: "images/slide1.png",
            description: "Showcasing innovative web and mobile solutions for modern businesses."
        },
        {
            image: "images/slide2.png",
            description: "Crafting seamless user experiences with cutting-edge technologies."
        },
        {
            image: "images/slide3.png",
            description: "Crafting seamless user experiences with cutting-edge technologies."
        },
        {
            image: "images/slide4.png",
            description: "Crafting seamless user experiences with cutting-edge technologies."
        },
        {
            image: "images/slide5.png",
            description: "Crafting seamless user experiences with cutting-edge technologies."
        }
    ],
    contact: {
        top: {
            pretitle: "Get In Touch",
            text: "I love to hear from you. Whether you have a question or just want to chat about development, tech & innovation — shoot me a message."
        },
        bottom: {
            reachMe: {
                email: "abdo.zad.raja2@gmail.com",
                phone: "+212680096104"
            },
            social: ["LinkedIn", "GitHub", "Twitter", "Instagram"]
        }
    },
    footer: {
        copyright: "© Copyright Zadelkhair Abdelkoddous 2023",
        designBy: "StyleShout",
        distributionBy: "Themewagon"
    }
};
