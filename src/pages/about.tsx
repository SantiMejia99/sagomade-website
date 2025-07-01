"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"

export default function About() {
  const [activeAccomplishment, setActiveAccomplishment] = useState(0)

  const experience = [
    {
      year: "2025 - Present",
      role: "Intermediate Designer",
      company: "The Biglieri Group",
      description: "Leading development of scalable web applications and mentoring junior developers.",
      highlight: true,
    },
    {
      year: "2022 - 2025",
      role: "Graphic Designer",
      company: "Weston Consulting",
      description: "Built responsive user interfaces and improved application performance by 40%.",
      highlight: false,
    },
    {
      year: "2021 - 2022",
      role: "Web Development Educator",
      company: "Creative Club Global",
      description: "Developed features for multiple client projects using modern web technologies.",
      highlight: false,
    },
        {
      year: "2020 - 2021",
      role: "Illustrator & Designer",
      company: "Perth County Inn",
      description: "Developed features for multiple client projects using modern web technologies.",
      highlight: false,
    },
  ]

  const accomplishments = [
    { metric: "2023", label: "Featured on Magazine Blue Edition, Polemicalzine (Toronto, Ontario)" },
    { metric: "2021", label: "Dean's Honour Roll, Graphic Design" },
    { metric: "2021", label: "Featured Product, Autonomous Dotai" },
    { metric: "2020", label: "Dean's Honour Roll, Graphic Design" },
    { metric: "2020", label: "Featured on Alfresco Boardwalk Gallery (Stratford, Ontario)" },
    { metric: "2020", label: "Featured on Basketball Court Inauguration (Stratford, Ontario)" },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAccomplishment((prev) => (prev + 1) % accomplishments.length)
    }, 2500)

    return () => clearInterval(interval)
  }, [accomplishments.length])

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto py-16 px-4 max-w-3xl">
        {/* Philosophy Section - Ultra Minimalist */}
        <section className="mb-16">
          <div className="space-y-6 text-sm leading-relaxed">
            <p className="text-muted-foreground/70 font-thin">
              My work explores the diverse relationship between urban ideologies and minimalism. Throughout design, I aspire to depict colour, imagery, and forms aesthetically pleasing, providing innovative solutions tailored to elevate.
            </p>
          </div>
        </section>

        <div className="w-full h-px bg-border/30 my-16"></div>

        {/* Competencies & Skills - Minimal List */}
        <section className="mb-24">
          <h2 className="text-2xl font-black mb-16 tracking-tight text-muted-foreground">Competencies & Skills</h2>

          <div className="space-y-12">
            {/* Technical Skills */}
            <div>
              <h3 className="text-md uppercase tracking-wider text-muted-foreground/60 mb-6 font-bold">Technical</h3>
              <div className="text-sm grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-2 text-gray-400">
                {[
                  "React",
                  "TypeScript",
                  "Javascript",
                  "HTML",
                  "CSS",
                  "Tailwind CSS",
                ].map((skill) => (
                  <div
                    key={skill}
                    className="text-foreground/70 hover:text-foreground transition-colors duration-200 cursor-default"
                  >
                    {skill}
                  </div>
                ))}
              </div>
            </div>

            {/* Design Skills */}
            <div>
              <h3 className="text-md uppercase tracking-wider text-muted-foreground/60 mb-6 font-bold">Design</h3>
              <div className="text-sm grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-2 text-gray-400">
                {[
                  "Figma",
                  "Adobe Creative Suite",
                  "UI/UX Design",
                  "Prototyping",
                  "Design Systems",
                  "User Research",
                ].map((skill) => (
                  <div
                    key={skill}
                    className="text-foreground/70 hover:text-foreground transition-colors duration-200 cursor-default"
                  >
                    {skill}
                  </div>
                ))}
              </div>
            </div>

            {/* Leadership Skills */}
            <div>
              <h3 className="text-md uppercase tracking-wider text-muted-foreground/60 mb-6 font-bold">Leadership</h3>
              <div className="text-sm grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-2 text-gray-400">
                {[
                  "Team Leadership",
                  "Technical Mentoring",
                  "Code Review",
                  "Agile Methodologies",
                  "Project Management",
                  "Strategic Planning",
                ].map((skill) => (
                  <div
                    key={skill}
                    className="text-foreground/70 hover:text-foreground transition-colors duration-200 cursor-default"
                  >
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="w-full h-px bg-border/30 my-16"></div>

        {/* Experience Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-black mb-16 tracking-tight text-muted-foreground">Experience</h2>
          <div className="space-y-12 text-left">
            {experience.map((exp, index) => (
              <div key={index} className="group">
                <div className="flex flex-col md:flex-row md:items-baseline gap-4 md:gap-8">
                  <div className="md:w-50 flex-shrink-0">
                    <span className="text-sm text-muted-foreground/60 font-mono text-gray-400">{exp.year}</span>
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors duration-200">
                      {exp.role}
                    </h3>
                    <p className="text-muted-foreground font-bold">{exp.company}</p>
                    <p className="text-sm text-muted-foreground/80 font-thin leading-tight text-gray-400">{exp.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="w-full h-px bg-border/30 my-16"></div>

        {/* Accomplishments - Minimal Grid */}
        <section className="mb-16 justify-center align-center"> 
          <h2 className="text-2xl font-black mb-16 tracking-tight text-muted-foreground">Accomplishments</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {accomplishments.map((accomplishment, index) => (
              <div
                key={index}
                className={`text-center space-y-2 transition-all duration-300 ${
                  activeAccomplishment === index ? "opacity-100" : "opacity-60"
                }`}
              >
                <div className="text-2xl md:text-2xl font-bold text-foreground">{accomplishment.metric}</div>
                <div className="text-sm text-muted-foreground/70 font-thin leading-tight">{accomplishment.label}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="w-full h-px bg-border/30 my-16"></div>

        {/* Contact CTA - Minimal */}
        <section className="text-center my-16">
          <div className="inline-flex items-center gap-3 text-foreground hover:text-primary transition-colors duration-200 cursor-pointer group">
            <Link to="https://drive.google.com/file/d/1AENiTRBaTQ8Zh-0m69mwTVa0pGqXcDI0/view?usp=sharing" className="font-bold" target="_blank" rel="noopener noreferrer">
              DOWNLOAD CV
            </Link>
            <span className="transform group-hover:translate-x-1 transition-transform duration-200">→</span>
          </div>
        </section>
      </main>
    </div>
  )
}
