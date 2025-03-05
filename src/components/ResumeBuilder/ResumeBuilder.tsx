import React, { useState } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer, Font } from '@react-pdf/renderer';

interface Experience {
    id: number;
    position: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    achievements: string[];
  }
  
  interface Education {
    id: number;
    degree: string;
    institution: string;
    location: string;
    startDate: string;
    endDate: string;
    highlights: string;
  }
  
  interface Certification {
    id: number;
    name: string;
    issuer: string;
    date: string;
  }
  
  interface PersonalInfo {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    website: string;
  }
  
  interface FormData {
    personalInfo: PersonalInfo;
    summary: string;
    experience: Experience[];
    education: Education[];
    skills: string[];
    certifications: Certification[];
  }
const ResumeBuilder = () => {
    const [formData, setFormData] = useState<FormData>({
        personalInfo: {
          name: 'Enter your full name',
          title: 'e.g., Software Engineer, Data Analyst',
          email: 'your.email@example.com',
          phone: 'e.g., +1 (123) 456-7890',
          location: 'e.g., New York, NY',
          linkedin: 'linkedin.com/in/yourprofile',
          website: 'yourwebsite.com',
        },
        summary: 'Write a brief summary of your professional background and key skills',
        experience: [
          {
            id:Date.now(),
            position: 'e.g., Senior Software Developer',
            company: 'e.g., Tech Corp',
            location: 'e.g., San Francisco, CA',
            startDate: 'e.g., Jan 2020',
            endDate: 'e.g., Present',
            achievements: ['Describe a key achievement or responsibility'],
          },
        ],
        education: [
          {
            id:Date.now(),
            degree: 'e.g., Bachelor of Science in Computer Science',
            institution: 'e.g., University of California',
            location: 'e.g., Berkeley, CA',
            startDate: 'e.g., 2014',
            endDate: 'e.g., 2018',
            highlights: 'GPA, honors, relevant coursework, etc.',
          },
        ],
        skills: ['Enter skills separated by commas (e.g., JavaScript, Python, Leadership)'],
        certifications: [
          {
            id:Date.now(),
            name: 'e.g., AWS Certified Solutions Architect',
            issuer: 'e.g., Amazon Web Services',
            date: 'e.g., 2023',
          },
        ],
      });

  const ModernResume = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerMain}>
            <Text style={styles.name}>{formData.personalInfo.name}</Text>
            <Text style={styles.title}>{formData.personalInfo.title}</Text>
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactDetail}>{formData.personalInfo.email}</Text>
            <Text style={styles.contactDetail}>{formData.personalInfo.phone}</Text>
            <Text style={styles.contactDetail}>{formData.personalInfo.location}</Text>
            {formData.personalInfo.linkedin && (
              <Text style={styles.contactDetail}>{formData.personalInfo.linkedin}</Text>
            )}
            {formData.personalInfo.website && (
              <Text style={styles.contactDetail}>{formData.personalInfo.website}</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.divider} />
          <Text style={styles.summaryText}>{formData.summary}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          <View style={styles.divider} />
          {formData.experience.map((exp) => (
            <View key={exp.id} style={styles.experienceItem}>
              <View style={styles.jobHeader}>
                <Text style={styles.position}>{exp.position}</Text>
                <Text style={styles.dates}>{exp.startDate} - {exp.endDate}</Text>
              </View>
              <View style={styles.companyInfo}>
                <Text style={styles.company}>{exp.company}, {exp.location}</Text>
              </View>
              <View style={styles.achievements}>
                {exp.achievements.map((achievement, index) => (
                  <Text key={index} style={styles.achievement}>• {achievement}</Text>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Education */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          <View style={styles.divider} />
          {formData.education.map((edu) => (
            <View key={edu.id} style={styles.educationItem}>
              <View style={styles.eduHeader}>
                <Text style={styles.degree}>{edu.degree}</Text>
                <Text style={styles.dates}>{edu.startDate} - {edu.endDate}</Text>
              </View>
              <Text style={styles.institution}>{edu.institution}, {edu.location}</Text>
              {edu.highlights && <Text style={styles.highlights}>{edu.highlights}</Text>}
            </View>
          ))}
        </View>

        {/* Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.divider} />
          <View style={styles.skillsContainer}>
            {formData.skills.map((skill, index) => (
              <Text key={index} style={styles.skill}>{skill}</Text>
            ))}
          </View>
        </View>

        {/* Certifications */}
        {formData.certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            <View style={styles.divider} />
            {formData.certifications.map((cert) => (
              <View key={cert.id} style={styles.certItem}>
                <Text style={styles.certName}>{cert.name}</Text>
                <Text style={styles.certDetail}>{cert.issuer} | {cert.date}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
  Font.register({
    family: 'Roboto',
    src: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf',
  });
  
  const styles = StyleSheet.create({
    page: {
      padding: 30,
      backgroundColor: '#FFFFFF',
      fontFamily: 'Helvetica',
    },
    header: {
      flexDirection: 'row',
      marginBottom: 20,
      justifyContent: 'space-between',
      borderBottom: '1 solid #102A43',
      paddingBottom: 10,
    },
    headerMain: {
      flex: 1,
    },
    name: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#102A43',
      marginBottom: 4,
    },
    title: {
      fontSize: 14,
      color: '#334E68',
    },
    contactInfo: {
      alignItems: 'flex-end',
    },
    contactDetail: {
      fontSize: 10,
      color: '#334E68',
      marginBottom: 2,
    },
    section: {
      marginBottom: 15,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#102A43',
      textTransform: 'uppercase',
    },
    divider: {
      borderBottom: '1 solid #9FB3C8',
      marginVertical: 4,
    },
    summaryText: {
      fontSize: 11,
      color: '#334E68',
      lineHeight: 1.5,
      marginTop: 8,
    },
    experienceItem: {
      marginBottom: 12,
    },
    jobHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
    },
    position: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#243B53',
    },
    company: {
      fontSize: 11,
      color: '#334E68',
      fontStyle: 'italic',
    },
    companyInfo: {
      marginBottom: 5,
    },
    dates: {
      fontSize: 10,
      color: '#486581',
    },
    achievements: {
      marginTop: 4,
    },
    achievement: {
      fontSize: 10,
      color: '#334E68',
      marginVertical: 2,
      lineHeight: 1.4,
    },
    educationItem: {
      marginTop: 8,
      marginBottom: 8,
    },
    eduHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    degree: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#243B53',
    },
    institution: {
      fontSize: 11,
      color: '#334E68',
      fontStyle: 'italic',
    },
    highlights: {
      fontSize: 10,
      color: '#486581',
      marginTop: 2,
    },
    skillsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 8,
    },
    skill: {
      fontSize: 10,
      color: '#334E68',
      backgroundColor: '#F0F4F8',
      padding: 4,
      borderRadius: 4,
      marginRight: 8,
      marginBottom: 8,
    },
    certItem: {
      marginTop: 8,
    },
    certName: {
      fontSize: 11,
      fontWeight: 'bold',
      color: '#243B53',
    },
    certDetail: {
      fontSize: 10,
      color: '#486581',
    },
  });

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [name]: value,
      },
    }));
  };
  

  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, summary: e.target.value }));
  };

  const handleExperienceChange = (index: number, field: keyof Experience, value: string) => {
    setFormData((prev) => {
      const newExperience = [...prev.experience];
      newExperience[index] = { ...newExperience[index], [field]: value };
      return { ...prev, experience: newExperience };
    });
  };
  const handleAchievementChange = (expIndex: number, achIndex: number, value: string) => {
    setFormData((prev) => {
      const newExperience = [...prev.experience];
      newExperience[expIndex].achievements[achIndex] = value;
      return { ...prev, experience: newExperience };
    });
  };

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [
        ...formData.experience,
        {
          id: Date.now(),
          position: '',
          company: '',
          location: '',
          startDate: '',
          endDate: '',
          achievements: [''],
        },
      ],
    });
  };

  const addAchievement = (expIndex: number) => {
    setFormData((prev) => {
      const newExperience = [...prev.experience];
      newExperience[expIndex].achievements.push('');
      return { ...prev, experience: newExperience };
    });
  };
  const handleEducationChange = (index: number, field: keyof Education, value: string) => {
    setFormData((prev) => {
      const newEducation = [...prev.education];
      newEducation[index] = { ...newEducation[index], [field]: value };
      return { ...prev, education: newEducation };
    });
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [
        ...formData.education,
        {
          id: Date.now(),
          degree: '',
          institution: '',
          location: '',
          startDate: '',
          endDate: '',
          highlights: '',
        },
      ],
    });
  };
  const handleSkillsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      skills: e.target.value.split(',').map((skill) => skill.trim()),
    }));
  };  
  const handleCertificationChange = (index: number, field: keyof Certification, value: string) => {
    setFormData((prev) => {
      const newCertifications = [...prev.certifications];
      newCertifications[index] = { ...newCertifications[index], [field]: value };
      return { ...prev, certifications: newCertifications };
    });
  };

  const addCertification = () => {
    setFormData({
      ...formData,
      certifications: [
        ...formData.certifications,
        {
          id: Date.now(),
          name: '',
          issuer: '',
          date: '',
        },
      ],
    });
  };

  return (
    <div className="resume-builder">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-400">Resume Builder</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-secondary text-white rounded-lg shadow-lg p-6 overflow-y-auto max-h-screen no-scrollbar">
            <h2 className="text-xl font-semibold mb-4">Resume Information</h2>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 pb-1 border-b">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.personalInfo.name}
                    onChange={handlePersonalInfoChange}
                    className="w-full border border-gray-600 p-2 rounded-sm focus:border-gray-500 "
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Professional Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.personalInfo.title}
                    onChange={handlePersonalInfoChange}
                    className="w-full border border-gray-600 p-2 rounded-sm focus:border-gray-500 "
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.personalInfo.email}
                    onChange={handlePersonalInfoChange}
                    className="w-full border border-gray-600 p-2 rounded-sm focus:border-gray-500 "
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.personalInfo.phone}
                    onChange={handlePersonalInfoChange}
                    className="w-full border border-gray-300 p-2 rounded-sm focus:border-gray-400"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.personalInfo.location}
                    onChange={handlePersonalInfoChange}
                    className="w-full border border-gray-300 p-2 rounded-sm focus:border-gray-400"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">LinkedIn</label>
                  <input
                    type="text"
                    name="linkedin"
                    value={formData.personalInfo.linkedin}
                    onChange={handlePersonalInfoChange}
                    className="w-full border border-gray-300 p-2 rounded-sm focus:border-gray-400"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Website</label>
                  <input
                    type="text"
                    name="website"
                    value={formData.personalInfo.website}
                    onChange={handlePersonalInfoChange}
                    className="w-full border border-gray-300 p-2 rounded-sm focus:border-gray-400"
                  />
                </div>
              </div>
            </div>
            
            {/* Summary */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 pb-1 border-b">Professional Summary</h3>
              <textarea
                value={formData.summary}
                onChange={handleSummaryChange}
                className="w-full border border-gray-300 p-2 rounded-sm focus:border-gray-400 h-24"
                placeholder="Brief summary of your professional background and key strengths"
              />
            </div>
            
            {/* Work Experience */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3 pb-1 border-b">
                <h3 className="text-lg font-medium">Work Experience</h3>
                <button
                  type="button"
                  onClick={addExperience}
                  className="bg-gray-800 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                >
                  Add Position
                </button>
              </div>
              
              {formData.experience.map((exp, expIndex) => (
                <div key={exp.id} className="mb-6 p-4 border border-gray-400 rounded bg-secondary-50">
                  <h4 className="font-medium mb-3">Position {expIndex + 1}</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Job Title</label>
                      <input
                        type="text"
                        value={exp.position}
                        onChange={(e) => handleExperienceChange(expIndex, 'position', e.target.value)}
                        className="w-full border border-gray-300 p-2 rounded-sm focus:border-gray-400"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Company</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => handleExperienceChange(expIndex, 'company', e.target.value)}
                        className="w-full border border-gray-300 p-2 rounded-sm focus:border-gray-400"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Location</label>
                      <input
                        type="text"
                        value={exp.location}
                        onChange={(e) => handleExperienceChange(expIndex, 'location', e.target.value)}
                        className="w-full border border-gray-300 p-2 rounded-sm focus:border-gray-400"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium mb-1">Start Date</label>
                        <input
                          type="text"
                          value={exp.startDate}
                          onChange={(e) => handleExperienceChange(expIndex, 'startDate', e.target.value)}
                          className="w-full border border-gray-300 p-2 rounded-sm focus:border-gray-400"
                          placeholder="e.g., Jan 2020"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">End Date</label>
                        <input
                          type="text"
                          value={exp.endDate}
                          onChange={(e) => handleExperienceChange(expIndex, 'endDate', e.target.value)}
                          className="w-full border border-gray-300 p-2 rounded-sm focus:border-gray-400"
                          placeholder="e.g., Present"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium">Key Achievements</label>
                      <button
                        type="button"
                        onClick={() => addAchievement(expIndex)}
                        className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs hover:bg-gray-300"
                      >
                        Add Achievement
                      </button>
                    </div>
                    
                    {exp.achievements.map((achievement, achIndex) => (
                      <div key={achIndex} className="mb-2">
                        <input
                          type="text"
                          value={achievement}
                          onChange={(e) => handleAchievementChange(expIndex, achIndex, e.target.value)}
                          className="w-full border border-gray-300 p-2 rounded-sm focus:border-gray-400"
                          placeholder="Describe a key achievement or responsibility"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Education */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3 pb-1 border-b">
                <h3 className="text-lg font-medium">Education</h3>
                <button
                  type="button"
                  onClick={addEducation}
                  className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                >
                  Add Education
                </button>
              </div>
              
              {formData.education.map((edu, eduIndex) => (
                <div key={edu.id} className="mb-6 p-4 border rounded bg-secondary">
                  <h4 className="font-medium mb-3">Education {eduIndex + 1}</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Degree</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => handleEducationChange(eduIndex, 'degree', e.target.value)}
                        className="w-full border border-gray-300 p-2 rounded-sm focus:border-gray-400"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Institution</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => handleEducationChange(eduIndex, 'institution', e.target.value)}
                        className="w-full border border-gray-300 p-2 rounded-sm focus:border-gray-400"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Location</label>
                      <input
                        type="text"
                        value={edu.location}
                        onChange={(e) => handleEducationChange(eduIndex, 'location', e.target.value)}
                        className="w-full border border-gray-300 p-2 rounded-sm focus:border-gray-400"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium mb-1">Start Year</label>
                        <input
                          type="text"
                          value={edu.startDate}
                          onChange={(e) => handleEducationChange(eduIndex, 'startDate', e.target.value)}
                          className="w-full border border-gray-300 p-2 rounded-sm focus:border-gray-400"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">End Year</label>
                        <input
                          type="text"
                          value={edu.endDate}
                          onChange={(e) => handleEducationChange(eduIndex, 'endDate', e.target.value)}
                          className="w-full border border-gray-300 p-2 rounded-sm focus:border-gray-400"
                        />
                      </div>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Highlights</label>
                      <input
                        type="text"
                        value={edu.highlights}
                        onChange={(e) => handleEducationChange(eduIndex, 'highlights', e.target.value)}
                        className="w-full border border-gray-300 p-2 rounded-sm focus:border-gray-400"
                        placeholder="GPA, honors, relevant coursework, etc."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Skills */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 pb-1 border-b">Skills</h3>
              <p className="text-sm text-gray-600 mb-2">Enter skills separated by commas</p>
              <textarea
                value={formData.skills.join(', ')}
                onChange={handleSkillsChange}
                className="w-full border border-gray-300 p-2 rounded-sm focus:border-gray-400 h-20"
                placeholder="JavaScript, React, Node.js, etc."
              />
            </div>
            
            {/* Certifications */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3 pb-1 border-b">
                <h3 className="text-lg font-medium">Certifications</h3>
                <button
                  type="button"
                  onClick={addCertification}
                  className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                >
                  Add Certification
                </button>
              </div>
              
              {formData.certifications.map((cert, certIndex) => (
                <div key={cert.id} className="mb-4 p-3 border rounded bg-secondary-50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Certification Name</label>
                      <input
                        type="text"
                        value={cert.name}
                        onChange={(e) => handleCertificationChange(certIndex, 'name', e.target.value)}
                        className="w-full border border-gray-300 p-2 rounded-sm focus:border-gray-400"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Issuing Organization</label>
                      <input
                        type="text"
                        value={cert.issuer}
                        onChange={(e) => handleCertificationChange(certIndex, 'issuer', e.target.value)}
                        className="w-full border border-gray-300 p-2 rounded-sm focus:border-gray-400"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Date</label>
                      <input
                        type="text"
                        value={cert.date}
                        onChange={(e) => handleCertificationChange(certIndex, 'date', e.target.value)}
                        className="w-full border border-gray-300 p-2 rounded-sm focus:border-gray-400"
                        placeholder="e.g., 2023"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-secondary rounded-lg shadow-lg p-4">
            <h2 className="text-xl font-semibold mb-4 text-center text-gray-300">Resume Preview</h2>
            <div className="bg-black rounded border h-screen" style={{ overflow: 'auto' }}>
              <PDFViewer width="100%" height="100%" className="border-0">
                <ModernResume />
              </PDFViewer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;