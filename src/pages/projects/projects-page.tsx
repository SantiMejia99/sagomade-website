"use client"
import { useState, useEffect } from "react"
import { ArrowLeft, ExternalLink, Github, Calendar, Users, Palette } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

const projectData: Record<
  string,
  {
    title: string
    content: string
    subtitle: string
    description: string
    challenge: string
    solution: string
    results: string[]
    technologies: string[]
    role: string
    duration: string
    team: string
    year: string
    category: string
    liveUrl?: string
    githubUrl?: string
    images: string[]
  }
> = {
  "1": {
    title: "Consultation Notice",
    content: "This is the Consultation Notice project.",
    subtitle: "The project effectively incorporates key elements of urban design, including adherence to AODA standards for accessibility and inclusivity.",
    description:
      "Designed for clarity, accessibility, and engagement, fully AODA-compliant. The layout features a custom map, interactive QR codes, and a modular template for efficient rollout. Printed on recyclable stock, the piece balances environmental responsibility with thoughtful, user-focused design.",
    challenge:
      "Design a public notice to inform nearby residents about an upcoming development, with strict adherence to AODA accessibility standards. The piece needed to be legible, modern, and visually consistent with the existing identity system, while also being easy to reproduce and environmentally conscious.",
    solution:
      "The layout was structured using accessible typography, a clear visual hierarchy, and a modular template to ensure consistency and efficient rollout. Visual elements, including a custom-designed map, were created to meet accessibility guidelines and enhance clarity. Integrated QR codes allow for extended digital engagement, and the final piece was printed on recyclable stock, reinforcing sustainable design practices.",
    results: [
      "100% compliance with AODA accessibility standards, verified through internal accessibility review",
      "40% increase in engagement through QR code scans compared to previous static notices.",
      "100% recyclable materials used, supporting the organization’s sustainability targets.",
      "Positive feedback from planning staff and residents, citing improved readability and clarity.",
    ],
    technologies: ["Adobe Photoshop", "Adobe Illustrator", "Adobe InDesign"],
    role: "Product & Graphic Designer",
    duration: "2 months",
    team: "1 designer, 1 project manager",
    year: "2024",
    category: "Product Design",
    liveUrl: "https://consultation-notice.example.com",
    githubUrl: "https://github.com/example/consultation-notice",
    images: ["/projects/consultation-notice/notice-1.jpg", "/projects/consultation-notice/notice-2.jpg", "/projects/consultation-notice/notice-3.jpg", "/projects/consultation-notice/notice-4.jpg"],
  },
  "2": {
    title: "Espacio Ideal",
    content: "This is the Espacio Ideal project.",
    subtitle: "Architectural form meets typographic precision in a custom typeface designed for expressive identity systems.",
    description:
      "Espacio Ideal explores typography through the lens of architecture, where thin, sharp forms contrast with bold structural elements to create a refined and visually dynamic type system. Designed for logos and small-scale titles, the font merges architectural detail with typographic artistry.",
    challenge:
      "To design a typographic system that visually communicates architectural language, translating the structural, minimal, and spatial qualities of architecture into a functional typeface for branding and display.",
    solution:
      "The typeface was developed from real architectural plans and forms. Edges, intersections, and proportions were carefully constructed to echo the visual language of modern architecture. The resulting characters emphasize contrast, spatial rhythm, and sharp detailing, balancing legibility with visual impact.",
    results: [
      "A custom display font optimized for logos and headline use",
      "Maintains strong readability through intentional form balance",
      "Emphasizes line and shape precision inspired by architectural drafting",
      "Adaptable for a range of editorial, branding, and digital applications",
    ],
    technologies: ["FontForge", "Procreate", "Adobe Photoshop", "Adobe Illustrator"],
    role: "Typeface Designer",
    duration: "5 months",
    team: "1 designer",
    year: "2023",
    category: "Typeface Design",
    liveUrl: "https://espacio-ideal.example.com",
    images: ["/projects/espacio-ideal/espacio-ideal-1.jpg", "/projects/espacio-ideal/espacio-ideal-2.jpg", "/projects/espacio-ideal/espacio-ideal-3.png "],
  },
  "3": {
    title: "Wine Bottles",
    content: "This is the Wine Bottles project.",
    subtitle: "Premium wine collection and tasting experience",
    description:
      "A limited-edition wine and packaging experience designed to celebrate employees on Mother’s and Father’s Day. This project blends visual storytelling with sensory alignment, each bottle tailored to complement its selected wine flavour, resulting in a cohesive expression of appreciation, warmth, and brand elegance.",
    challenge:
      "To create a visually sophisticated gift that not only honors employees but also harmonizes with the wine’s profile—requiring thoughtful collaboration between design, brand identity, and oenological expertise.",
    solution:
      "Led the creative vision from concept to execution, working alongside a wine conmsultant to pair flavour profiles with visual tone. Designed refined labels and packaging using Adobe Illustrator, Photoshop, and InDesign, balancing floating shapes, soft palettes, and subtle 3D effects to evoke richness and warmth. Underwent internal review cycles to ensure alignment with Weston Consulting’s values and design standards.",
    results: [
      "Cohesive wine and packaging pairings driven by flavour and form",
      "Elegant, seasonal design that communicates appreciation and care",
      "High readability and visual impact through precise layout and detailing",
      "Reinforced internal culture with a unique, experience-driven gesture",
    ],
    technologies: ["Adobe Photoshop", "Adobe Illustrator", "Adobe InDesign"],
    role: "Creative Lead",
    duration: "5 months",
    team: "1 designer, 1 wine consultant",
    year: "2024",
    category: "Package Design",
    liveUrl: "https://wine-bottles.example.com",
    images: ["/projects/wine-bottles/wine-bottle-1.png", "/projects/wine-bottles/wine-bottle-2.png", "/projects/wine-bottles/wine-bottle-3.jpg", "/projects/wine-bottles/wine-bottle-4.jpg"],
  },
  "4": {
    title: "Burlington Co.",
    content: "This is the Burlington Co. project.",
    subtitle: "A bold fusion of hand-drawn artistry and accessible design, celebrating local spirit through expressive beer labels.",
    description:
      "A series of beer can labels created for a local brewery in Stratford, Ontario. Rooted in the town’s character and natural surroundings, the labels combine expressive linework with hand-drawn illustrations of native animals—infused with a personal illustrative style inspired by Alberto Giacometti. The result is a distinctive blend of local identity and fine art sensibility.",
    challenge:
      " To create packaging that communicates the brand’s local identity through original artwork while meeting commercial standards for readability, print clarity, and AODA accessibility. The challenge was to harmonize expressive illustration with clean, legible, and inclusive design.",
    solution:
      " Led the full design process by creating detailed digital illustrations in Procreate, then vectorizing and refining them in Illustrator for print accuracy. Composed layouts and typography in InDesign, ensuring clear hierarchy, optimal contrast, and spacing to meet AODA accessibility standards. Text placement was carefully balanced to preserve legibility while complementing the expressive linework.",
    results: [
      "Visually engaging beer label series rooted in local identity",
      "Original linework illustrations paired with accessible, compliant typography",
      "Strong visual hierarchy and layout structure for print and shelf clarity",
      "Positive reception from the brewery and local community for combining creativity with function",
    ],
    technologies: ["Procreate", "Adobe Photoshop", "Adobe Illustrator", "Adobe InDesign"],
    role: "Frontend Developer & Designer",
    duration: "3 months",
    team: "1 Designer",
    year: "2022",
    category: "Illustration & Package Design",
    liveUrl: "https://burlington-co.example.com",
    images: ["/projects/burlington-co/burlington-1.jpg", "/projects/burlington-co/burlington-2.jpg", "/projects/burlington-co/burlington-3.jpg", "/projects/burlington-co/burlington-4.jpg", "/projects/burlington-co/burlington-5.png", "/projects/burlington-co/burlington-6.jpg"],
  },
  "5": {
    title: "Autonomous Standing Desk",
    content: "This is the Autonomous Standing Desk project.",
    subtitle: "Transforming ergonomic office furniture into vibrant, inspiring workspaces through custom illustration.",
    description:
      " As part of the Autonomous X Artists collaboration, I contributed original artwork to a series of painted desk tabletops, merging art with function. This project elevated a common office desk into a personalized creative space, sparking inspiration and expression in everyday work environments. Seeing my designs brought to life on durable surfaces and made available to the public was deeply rewarding.",
    challenge:
      " To design illustrations that enhance the desk’s aesthetic without compromising usability, balancing bold visual impact with practical considerations like wear resistance and spatial layout on the desk surface.",
    solution:
      " Started with concept sketches in Procreate, refining compositions for balance and theme. Final designs were polished in Photoshop and Illustrator to ensure precise linework, color accuracy, and print readiness. Artwork was optimized for durability on textured desk surfaces, with careful placement to avoid interfering with ergonomic zones, blending creative expression with functional design.",
    results: [
      "Custom illustrated desk sold to the public through a special edition auction",
      "Positive reception for the fusion of functional design and creative expression",
      "Durable, vibrant prints that maintain visual impact through daily use",
      "Contribution to redefining workspaces as inspiring, personalized environments",
    ],
    technologies: ["Procreate", "Adobe Photoshop", "Adobe Illustrator"],
    role: "Creative Illustrator & Designer",
    duration: "8 months",
    team: "1 Designer, Autonomous Production Team",
    year: "2023",
    category: "Product Design",
    githubUrl: "https://github.com/example/autonomous-desk",
    images: ["/projects/autonomous-desk/autonomous-1.jpg", "/projects/autonomous-desk/autonomous-5.jpg", "/projects/autonomous-desk/autonomous-3.jpg", "/projects/autonomous-desk/autonomous-4.jpg"],
  },
  "6": {
    title: "POSS Magazine",
    content: "This is the POSS Magazine project.",
    subtitle: " A minimalist, art-driven magazine redefining urban expression through refined typography and imagery.",
    description:
      "Product of a Sick Society Magazine is a thoughtfully designed publication that merges fashion, aesthetics, and minimalism into a printed art gallery. Inspired by a previous clothing brand project, it serves as a fresh platform for urban culture, art, music, and personal expression, delivered through clean layouts and a restrained color palette.",
    challenge:
      "To create a sophisticated magazine layout that balances artistic expression with minimalism, delivering a visually immersive experience while maintaining clarity and cohesion across diverse content types.",
    solution:
      " Utilized Blender to create custom 3D graphic assets and editorial mockups, adding dimensionality and visual depth to the magazine’s clean aesthetic. Imagery was further refined in Photoshop using a restrained, minimalist color palette to maintain visual cohesion. Layouts and templates were designed in InDesign, prioritizing white space, grid structure, and typographic clarity. The overall system emphasized balance, ensuring each spread communicated a strong visual narrative without overwhelming the viewer.",
    results: [
      "A distinctive magazine format praised for its minimalist yet impactful design",
      "Successfully conveyed urban and artistic themes through clean visual storytelling",
      "Produced a versatile print piece that complements contemporary environments",
      "Enhanced brand identity with a unique editorial voice and presentation style",
    ],
    technologies: ["Adobe Photoshop", "Adobe Illustrator", "Adobe InDesign", "Blender"],
    role: "Lead Designer",
    duration: "5 Months",
    team: "2 Designers",
    year: "2023",
    category: "Digital Publishing",
    liveUrl: "https://poss-magazine.example.com",
    images: ["/projects/poss-magazine/poss-2.jpg", "/projects/poss-magazine/poss-3.jpg"],
  },
  "7": {
    title: "Run, Ride or Walk",
    content: "This is the Run, Ride or Walk project.",
    subtitle: "A campaign identity built where movement, form, and color come together in a sole-inspired visual system.",
    description:
      "Comprehensive fitness platform that gamifies exercise routines, tracks multiple activity types, and builds community through challenges and social features.",
    challenge:
      " To develop a visual identity that captures the campaign’s themes of activity and connection, while ensuring that the design was impactful both as a printed shirt and a standalone logo across various applications.",
    solution:
      " The design leverages the organic geometry of a shoe sole to create a fluid, movement-inspired composition. A soft pastel palette ensures strong contrast and visibility on fabric, while maintaining an approachable tone. Custom typography was crafted for clarity and cohesion, aligning with the design’s dynamic forms. The result balances visual impact, legibility, and print adaptability across materials.",
    results: [
      "A cohesive shirt and logo system rooted in movement-inspired geometry",
      "Custom color palette and abstract forms that enhance visibility and energy",
      "Distinctive campaign logo with custom-crafted typography",
      "Positive reception from event participants and organizers for originality and visual impact",
    ],
    technologies: ["Procreate", "Adobe Photoshop", "Adobe Illustrator", "Adobe InDesign"],
    role: "Lead Designer",
    duration: "3 months",
    team: "1 Designer, 1 Coordinator",
    year: "2022",
    category: "Campaign & Apparel Design",
    liveUrl: "https://run-ride-walk.example.com",
    images: ["/projects/running-shirt/running-shirt-1.jpg", "/projects/running-shirt/running-shirt-2.jpg", "/projects/running-shirt/running-shirt-3.jpg", "/projects/running-shirt/running-shirt-4.jpg", "/projects/running-shirt/running-shirt-5.jpg", "/projects/running-shirt/running-shirt-6.jpg"],
    
    
  },
  "8": {
    title: "Green Standards Toolkit",
    content: "This is the Green Standards Toolkit project.",
    subtitle: "An accessible and visually unified toolkit designed to guide sustainable city planning with clarity and impact.",
    description:
      "The Green Standards Toolkit is a comprehensive planning document aimed at promoting sustainable urban development through clear, engaging design. Developed in collaboration with a senior urban designer and an architect, the toolkit communicates complex ideas through layered diagrams, strategic layouts, and accessible formatting, all aligned with AODA standards to ensure broad usability.",
    challenge:
      "To design a multi-page toolkit that simplifies and visualizes dense planning & urban design content while adhering to accessibility standards and maintaining a consistent, professional aesthetic throughout.",
    solution:
      " Developed a consistent layout system in InDesign and created custom iconography and layered diagrams in Photoshop and Illustrator for clarity and depth. Assisted with isometric and 3D visuals to enhance spatial understanding. Applied a recycling-inspired color palette to reinforce sustainability and meet accessibility standards. Carefully optimized file size through compression and web-ready formatting to ensure efficient digital distribution while maintaining quality.",
    results: [
      "A visually cohesive toolkit praised for its clarity, colour use and accessibility",
      "Full AODA compliance achieved through careful typographic, color, and layout decisions",
      "Seamless integration of custom diagrams and content, resulting in an engaging user experience",
      "Successfully supported interdisciplinary collaboration in communicating sustainable planning practices",
    ],
    technologies: ["Procreate", "Adobe Photoshop", "Adobe Illustrator", "Adobe InDesign"],
    role: "Visual Design Specialist",
    duration: "5 months",
    team: "1 Urban Designer, 1 Architect",
    year: "2023",
    category: "Layout, 3D & Book Design",
    liveUrl: "https://green-standards.example.com",
    images: ["/projects/green-toolkit/green-toolkit-1.png", "/projects/green-toolkit/green-toolkit-2.png", "/projects/green-toolkit/green-toolkit-3.png", "/projects/green-toolkit/green-toolkit-4.png"],
     
  },
  "9": {
    title: "Tote Bag",
    content: "This is the Tote Bag project.",
    subtitle: "An illustrated tote design that embodies urbanism and company spirit as a festive keepsake.",
    description:
      "Designed as part of the company’s Christmas gift package, this tote bag features an illustration that fuses intricate detailing with minimalism. Inspired by urbanism and city planning, the artwork reflects the company’s identity while maintaining a sophisticated and clean aesthetic through a restrained grey palette contrasting with the bag’s texture.",
    challenge:
      "To create an illustration that is visually compelling and thematically aligned with the company’s values, while ensuring the design works effectively on fabric and complements the tote’s material and festive context.",
    solution:
      "Utilized Procreate and Adobe Illustrator to craft precise digital illustrations, balancing fine detail and simplicity to maintain clarity on fabric. Oversaw the external printing process, selecting materials and print techniques that enhanced both visual fidelity and tactile quality, ensuring the final product was both elegant and durable.",
    results: [
      "A sophisticated tote design praised for its thematic cohesion and visual clarity",
      "Successful integration of urban-inspired illustration with company branding",
      "High-quality print execution that preserved detail and texture on fabric",
      "An appreciated, memorable gift that strengthens company culture and client relations",
    ],
    technologies: ["Adobe Procreate", "Adobe Photoshop", "Adobe Illustrator"],
    role: "Lead Designer",
    duration: "2 months",
    team: "1 Designer, 1 Coordinator",
    year: "2023",
    category: "E-commerce",
    liveUrl: "https://tote-bag.example.com",
    images: ["/projects/tote-bag/tote-1.jpg", "/projects/tote-bag/tote-2.jpg", "/projects/tote-bag/tote-3.jpg", "/projects/tote-bag/tote-4.jpg"],
  },
}

interface ProjectPageProps {
  params: {
    id: string
  }
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const [isVisible, setIsVisible] = useState(false)
  const { id } = params

  useEffect(() => {
    setIsVisible(true)
  }, [])

  if (!id || !projectData[id]) {
    return <div className="container mx-auto py-10 px-4">Project not found.</div>
  }

  const project = projectData[id]

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto py-16 px-4 max-w-4xl">
        {/* Back Navigation */}
        <div className="mb-12">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-200 group"
          >
            <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform duration-200" />
            <span>Back to work</span>
          </Link>
        </div>

        {/* Hero Section */}
        <section
          className={`mb-20 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-3 text-sm text-muted-foreground">
                <span>{project.category}</span>
                <span>•</span>
                <span>{project.year}</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tight">{project.title}</h1>
              <div className="w-16 h-px bg-foreground/20"></div>
              <p className="inline-flex text-sm text-muted-foreground text-muted-foreground/70 font-thin leading-relaxed max-w-3xl">
                {project.subtitle}
              </p>
            </div>
          </div>
        </section>

        {/* Project Images */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-2">
            {project.images.map((image, index) => (
              <div key={index} className="aspect-auto bg-muted rounded-lg overflow-hidden">
                <img
                  src={image || "/placeholder.svg"}
                  alt={`${project.title} screenshot ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Project Details Grid */}
        <section className="mb-12 text-left">
          <div className="grid md:grid-cols-3 gap-12">
            {/* Project Info */}
            <div className="space-y-8">
              <div>
                <h3 className="text-md uppercase text-muted-foreground/60 mb-4 font-black">
                  Project Details
                </h3>
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <Calendar className="h-4 w-auto text-muted-foreground" />
                    <div>
                      <div className="text-sm font-black text-muted-foreground">Duration</div>
                      <div className="text-sm text-muted-foreground/60 font-mono text-gray-400">{project.duration}</div>
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <Users className="h-4 w-auto text-muted-foreground" />
                    <div>
                      <div className="text-sm font-black text-muted-foreground">Team</div>
                      <div className="text-sm text-muted-foreground/60 font-mono text-gray-400">{project.team}</div>
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <Palette className="h-4 w-auto text-muted-foreground" />
                    <div>
                      <div className="text-sm font-black text-muted-foreground">Role</div>
                      <div className="text-sm text-muted-foreground/60 font-mono text-gray-400">{project.role}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technologies */}
              <div>
                <h3 className="text-md uppercase text-muted-foreground/60 mb-4 font-black">
                  Technologies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <span key={tech} className="px-2 py-1 bg-muted/50 text-muted-foreground text-sm rounded-full text-gray-400">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Links */}
              <div className="space-y-3">
                {project.liveUrl && (
                  <Button asChild variant="outline" className="w-full justify-start">
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Read More About it
                    </a>
                  </Button>
                )}
                {project.githubUrl && (
                  <Button asChild variant="outline" className="w-full justify-start">
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4 mr-2" />
                      View Code
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {/* Project Content */}
            <div className="md:col-span-2 space-y-12">
              {/* Overview */}
              <div>
                <h2 className="text-2xl font-black mb-4 tracking-tight text-muted-foreground">Overview</h2>
                <p className="text-sm text-muted-foreground/60 font-mono text-gray-400">{project.description}</p>
              </div>

              {/* Challenge */}
              <div>
                <h2 className="text-2xl font-black mb-4 tracking-tight text-muted-foreground">Challenge</h2>
                <p className="text-sm text-muted-foreground/60 font-mono text-gray-400">{project.challenge}</p>
              </div>

              {/* Solution */}
              <div>
                <h2 className="text-2xl font-black mb-4 tracking-tight text-muted-foreground">Solution</h2>
                <p className="text-sm text-muted-foreground/60 font-mono text-gray-400">{project.solution}</p>
              </div>

              {/* Results */}
              <div>
                <h2 className="text-2xl font-black mb-4 tracking-tight text-muted-foreground">Results</h2>
                <div className="space-y-4">
                  {project.results.map((result, index) => (
                    <div key={index} className="flex">
                      <div className="mt-2.5 flex-shrink-0"></div>
                      <p className="text-sm text-muted-foreground/60 font-mono text-gray-400">{result}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
