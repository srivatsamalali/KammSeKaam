import React from 'react'
import PublicHeader from '../components/PublicHeader'

const contributors = [
  {
    name: 'Rahul Bharatiya',
    title: 'Founder, Aston Recruitment | Director, Varsha Vegetable Co.',
    subtitle: 'Christ University & University of Birmingham Alumnus.',
    description:
      'Rahul brings a practical approach to business operations and client engagement, focusing on delivering value through effective coordination and execution. He is committed to building strong professional relationships and supporting organizational growth.',
    image: '/rahul.jpeg',
    link: 'https://www.linkedin.com/in/rahul-bharatiya-kadur-294880123/?skipRedirect=true',
  },
  {
    name: 'Srivatsa Malali',
    title: 'Senior Software Test Engineer @ Wipro | ISTQB® Certified',
    subtitle: 'QA Automation Engineer and co-founder.',
    description:
      'Srivatsa is a QA Automation Engineer with expertise in Java, Selenium, API Testing, Cucumber, and CI/CD practices. Alongside his software testing career, he is passionate about building innovative technology solutions and co-founding ventures that connect businesses with exceptional talent.',
    image: '/srivatsa.jpeg',
    link: 'https://www.linkedin.com/in/srivatsamalali/',
  },
  {
    name: 'Adithya Bharadwaj',
    title: 'DevOps Engineer at Siemens Healthineers',
    subtitle: 'Technology professional with a passion for reliability.',
    description:
      'Adithya is a technology professional with a strong interest in delivering innovative and reliable digital solutions. He is passionate about continuous learning, collaboration, and leveraging modern technologies to solve real-world challenges.',
    image: '/adithya.png',
    link: 'https://www.linkedin.com/in/adithya-c-s-00661b23b/',
  },
  {
    name: 'Akshay Kirani',
    title: 'CEO of KRiAA Interiors',
    subtitle: 'Interior Designer and project execution expert.',
    description:
      'Akshay is an Interior Designer with expertise in residential and commercial space planning, design visualization, and project execution. He combines creativity with practical design solutions to create functional and aesthetically appealing interiors.',
    image: '/akshay.jpeg',
    link: 'https://www.linkedin.com/in/akshay-kirani-978016166/',
  },
]

const Contributors = () => {
  return (
    <div className="min-h-screen page-shell">
      <PublicHeader />
      <div className="w-full max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="glass-card p-10 mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Contributors
          </h1>
          <p className="text-slate-600 text-lg leading-relaxed">
            Meet the founding and technical team who help shape Aston
            Recruitment.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {contributors.map((contributor, index) => (
            <div
              key={contributor.name}
              className="glass-card p-8 border border-slate-200 shadow-xl hover:-translate-y-2 transition-transform duration-300"
              style={{
                animationDelay: `${index * 80}ms`,
                animationName: 'fadeInUp',
                animationDuration: '550ms',
                animationFillMode: 'both',
              }}
            >
              <div className="flex items-center gap-5 mb-6">
                <img
                  src={contributor.image}
                  alt={contributor.name}
                  className="h-24 w-24 rounded-3xl object-cover border border-slate-200"
                />
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    {contributor.name}
                  </h2>
                  <p className="text-slate-500 mt-1">{contributor.title}</p>
                </div>
              </div>
              <p className="text-slate-600 leading-relaxed mb-6">
                {contributor.description}
              </p>
              <a
                href={contributor.link}
                className="inline-flex items-center gap-2 text-sky-700 font-semibold"
                target="_blank"
                rel="noreferrer"
              >
                View LinkedIn
                <span aria-hidden="true">→</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Contributors
