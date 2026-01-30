
import React from 'react';
import { 
  Cpu, 
  Zap, 
  Wrench, 
  HardHat, 
  Beaker, 
  Code,
  Activity,
  Radio,
  Car
} from 'lucide-react';
import { Department, Semester, Subject, VideoLecture, ScholarshipPost, AppNotice } from './types';

export const SEMESTERS: Semester[] = [
  'Semester 1',
  'Semester 2',
  '3rd Semester',
  '4th Semester',
  '5th Semester',
  '6th Semester (Normal)',
  '6th Semester (Internship)'
];

export const SEMESTER_URL_MAP: Record<string, string> = {
  'Semester 1': 'sem1',
  'Semester 2': 'sem2',
  '3rd Semester': 'sem3',
  '4th Semester': 'sem4',
  '5th Semester': 'sem5',
  '6th Semester (Normal)': 'sem6-nrl',
  '6th Semester (Internship)': 'sem6-inp'
};

export const URL_SEMESTER_MAP: Record<string, Semester> = Object.entries(SEMESTER_URL_MAP).reduce((acc, [k, v]) => {
  acc[v] = k as Semester;
  return acc;
}, {} as Record<string, Semester>);

// Helper to create consistent subject structure
const createSubject = (id: string, title: string, semester: Semester, description: string, driveLink: string = ''): Subject => {
  return {
    id,
    title,
    semester,
    description,
    driveLink: driveLink || 'https://drive.google.com/',
    categories: []
  };
};

export const SCHOLARSHIPS: ScholarshipPost[] = [
  {
    id: 's_1',
    title: 'Pragati Scholarship Scheme',
    provider: 'AICTE',
    amount: '₹50,000 / year',
    deadline: '2025-10-31',
    description: 'A scholarship scheme implemented by AICTE aimed at providing assistance for advancement of Girls pursuing technical education.',
    eligibility: [
      'Maximum two girl children per family.',
      'Family income should be less than Rs. 8 Lakhs per annum.',
      'Admitted to 1st year of Diploma/Degree program.',
    ],
    applicationLink: 'https://scholarships.gov.in/',
    tags: ['Girls Only', 'Central Govt', 'Merit'],
    isNew: true,
  },
  {
    id: 's_2',
    title: 'Post Metric Scholarship (e-Grantz)',
    provider: 'Govt. of Kerala',
    amount: 'Full Fee Waiver + Stipend',
    deadline: 'Open Year Round',
    description: 'Financial assistance to students belonging to reserved categories (SC/ST/OBC/OEC) pursuing post-matriculation studies.',
    eligibility: [
      'Student must belong to SC/ST/OBC/OEC/SEBC categories.',
      'Attendance percentage constraints apply.',
      'Income limits apply for OBC/OEC categories.',
    ],
    applicationLink: 'https://www.egrantz.kerala.gov.in/',
    tags: ['State Govt', 'Reservation', 'Fee Waiver'],
  }
];

export const APP_NOTICES: AppNotice[] = [
  {
    id: 'n_1',
    date: 'Nov 15, 2023',
    title: 'PolyStudy 2.5 Released',
    content: 'We have updated the platform with new AI Tutor capabilities powered by Gemini 2.5, darker dark mode, and improved performance.',
    isNew: true,
    links: [{ label: 'Changelog', url: '#' }]
  },
  {
    id: 'n_2',
    date: 'Nov 10, 2023',
    title: 'Semester 5 & 3 Results Published',
    content: 'The results for the recent odd semester diploma examinations have been published by the board. Check your results now.',
    links: [{ label: 'Check Result', url: 'https://tekerala.org/' }]
  },
  {
    id: 'n_3',
    date: 'Oct 28, 2023',
    title: 'New Study Materials Added',
    content: 'Added comprehensive notes and previous year question papers for Computer Engineering Semester 4 and 6.',
  }
];

export const DEPARTMENTS: Department[] = [
  {
    id: 'ce',
    name: 'Computer Engineering',
    description: 'Software engineering, algorithms, system architecture, and programming.',
    icon: <Code className="w-8 h-8" />,
    color: 'bg-blue-500',
    subjects: [
      // Semester 1
      createSubject('ce_1001', 'Communication Skills in English', 'Semester 1', '1001', 'https://drive.google.com/drive/folders/1lLbdgqPOiBxIS_J2X2n04z301gUhzgOa?usp=drive_link'),
      createSubject('ce_1002', 'Mathematics I', 'Semester 1', '1002', 'https://drive.google.com/drive/folders/1RYrvhtOfSUtRFfYXMuKc8EZLXxRUa6KH?usp=drive_link'),
      createSubject('ce_1003', 'Applied Physics I', 'Semester 1', '1003', 'https://drive.google.com/drive/folders/1ni71OBk2CINoBnw_ZWoHI0RnAIZs8I3v?usp=drive_link'),
      createSubject('ce_1004', 'Applied Chemistry', 'Semester 1', '1004', 'https://drive.google.com/drive/folders/1MrP_Ov3-ozk4S8AvU8HGSl0j2dhDN07y?usp=drive_link'),
      createSubject('ce_1005', 'Engineering Graphics', 'Semester 1', '1005', 'https://drive.google.com/drive/folders/1jwj2c0MScxL7nhorg2RaEi7swRqzEx73?usp=drive_link'),
      createSubject('ce_2006', 'Applied Physics Lab', 'Semester 1', '2006', 'https://drive.google.com/drive/folders/1-aSZRggJBfxCLxeLukXnQVOAIJjwWCZf?usp=drive_link'),
      createSubject('ce_1007', 'Applied Chemistry Lab', 'Semester 1', '1007', 'https://drive.google.com/drive/folders/1APk6MIIfkFR6NetZgD_lp7DFLHUmKeRu?usp=drive_link'),
      createSubject('ce_1008', 'Introduction to IT systems Lab', 'Semester 1', '1008', 'https://drive.google.com/drive/folders/1C4wOB2E67kT_vhtRCTEqyVNOIh-xbAZa?usp=drive_link'),
      createSubject('ce_2009', 'Engineering Workshop Practice', 'Semester 1', '2009', 'https://drive.google.com/drive/folders/1JzzQAtX64D2R5DK9QfnAYcyXRpOqCx-F?usp=drive_link'),
      createSubject('ce_1009', 'Sports and Yoga', 'Semester 1', '1009', 'https://drive.google.com/drive/folders/1nah-BU6qEcHWYqtt03CD5DPW-2E-2Pp8?usp=drive_link'),
      // Semester 2
      createSubject('ce_2002', 'Mathematics II', 'Semester 2', '2002', 'https://drive.google.com/drive/folders/1cwo3hLmZFmsk85DiWq7YQFO9Zm2r7Kgm?usp=drive_link'),
      createSubject('ce_2003', 'Applied Physics II', 'Semester 2', '2003', 'https://drive.google.com/drive/folders/12x4yhoLJcGBwkdkMZ-SmSIogWBfL3Zm9?usp=drive_link'),
      createSubject('ce_2001', 'Environmental Science', 'Semester 2', '2001', 'https://drive.google.com/drive/folders/17x1moPjQ5XAqxvohRpgo3ujbWv6XUPee?usp=drive_link'),
      createSubject('ce_2031', 'Fundamentals of Electrical & Electronics Engineering', 'Semester 2', '2031', 'https://drive.google.com/drive/folders/1FTQLMAIs8eS-bJbb4i0JfQWLPyxvzSE6?usp=drive_link'),
      createSubject('ce_2131', 'Problem Solving and Programming', 'Semester 2', '2131', 'https://drive.google.com/drive/folders/1ufKi9UbpppeNMUtt76-lyLC57BdHA40y?usp=drive_link'),
      createSubject('ce_2008', 'Communication Skills in English Lab', 'Semester 2', '2008', 'https://drive.google.com/drive/folders/1VA3Yf2Rs5Se29B4g7qPRqs-DzGl0-NX_?usp=drive_link'),
      createSubject('ce_2006_s2', 'Applied Physics Lab', 'Semester 2', '2006', 'https://drive.google.com/drive/folders/1KKeZQiOyA0W7hDEqxh3t-AZsvmZyop1d?usp=drive_link'),
      createSubject('ce_2039', 'Fundamentals of Electrical & Electronics Engineering Lab', 'Semester 2', '2039', 'https://drive.google.com/drive/folders/1rtWzjvjR3OR983OttCxSdxtifNr7kC9L?usp=drive_link'),
      createSubject('ce_2139', 'Problem Solving and Programming Lab', 'Semester 2', '2139', 'https://drive.google.com/drive/folders/1_SB9BMZLizrDesw6Y8XDIWhnez1JjuLL?usp=drive_link'),
      createSubject('ce_2009_s2', 'Engineering Workshop Practice', 'Semester 2', '2009', 'https://drive.google.com/drive/folders/1XA6VMfYgLj-cJrtcrZvZ_XDRKkEGNFqU?usp=drive_link'),
      createSubject('ce_3009', 'Internship I', 'Semester 2', '3009', 'https://drive.google.com/drive/folders/1rOB8Y6xG-o7F2BDJYeR-C7TwodUfx9L-?usp=drive_link'),
      // Semester 3
      createSubject('ce_3131', 'Computer Organisation', '3rd Semester', '3131', 'https://drive.google.com/drive/folders/1Eek6HQLUtbM3RnfrYd2GqG_lwaGPfm_e?usp=drive_link'),
      createSubject('ce_3132', 'Programming in C', '3rd Semester', '3132', 'https://drive.google.com/drive/folders/1IdIqKN953spQ7YqL7RRtNnWV_jnZCg2q?usp=drive_link'),
      createSubject('ce_3133', 'Database Management Systems', '3rd Semester', '3133', 'https://drive.google.com/drive/folders/1wUS8XIffO-vjFbvUq4bAYHPixeVIbRi3?usp=drive_link'),
      createSubject('ce_3134', 'Digital Computer Fundamentals', '3rd Semester', '3134', 'https://drive.google.com/drive/folders/1FW0IC_PjC0xpge16-pixRubPrY7jm2Fl?usp=drive_link'),
      createSubject('ce_3135', 'Programming in C Lab', '3rd Semester', '3135', 'https://drive.google.com/drive/folders/1pFvo9XnCnmhOn4frd34McVKpnvvEm-rk?usp=drive_link'),
      createSubject('ce_3136', 'Database Management System Lab', '3rd Semester', '3136', 'https://drive.google.com/drive/folders/1l-rOd32RReYUQU1xDgi2Dg4OmxuQeeuO?usp=drive_link'),
      createSubject('ce_3137', 'Digital Computer Fundamentals Lab', '3rd Semester', '3137', 'https://drive.google.com/drive/folders/1usOO8Mf-ROB255TQDAyvceyVEBs8flLF?usp=drive_link'),
      createSubject('ce_3138', 'Web Technology Lab', '3rd Semester', '3138', 'https://drive.google.com/drive/folders/1D7ysIU76JLmyr8_4a0HH89k68x4_2k6U?usp=drive_link'),
      createSubject('ce_3139', 'Computer System Hardware Lab', '3rd Semester', '3139', 'https://drive.google.com/drive/folders/1F0OBsT0ERZfBDG5LPoDWSHYHjvxtvf3T?usp=drive_link'),
      // Semester 4
      createSubject('ce_4131', 'Object Oriented Programming', '4th Semester', '4131', 'https://drive.google.com/drive/folders/157VKruyAFbPGZ_hmNpfaeWZd_hxDJrT_?usp=drive_link'),
      createSubject('ce_4132', 'Computer Communication and Networks', '4th Semester', '4132', 'https://drive.google.com/drive/folders/1CpbPL7T3ZEsbjDkESQdGHBaQTTv_QnwD?usp=drive_link'),
      createSubject('ce_4133', 'Data Structures', '4th Semester', '4133', 'https://drive.google.com/drive/folders/1Ryab5KvjCKK_ROordCUodK-w01MoFqy5?usp=drive_link'),
      createSubject('ce_4001', 'Community Skills in Indian knowledge system', '4th Semester', '4001', 'https://drive.google.com/drive/folders/1fJI-5Wx9RCdPOvqb2L8-5PoDzwGf4gkZ?usp=drive_link'),
      createSubject('ce_4136', 'Object Oriented Programming Lab', '4th Semester', '4136', 'https://drive.google.com/drive/folders/1s5rlN1uH0NXhtSeUM1NDAIQUhDRbGPzj?usp=drive_link'),
      createSubject('ce_4137', 'Web Programming Lab', '4th Semester', '4137', 'https://drive.google.com/drive/folders/170Y09em7G0QsHOoeJEtT2PegXoYwcF6E?usp=drive_link'),
      createSubject('ce_4138', 'Data Structures Lab', '4th Semester', '4138', 'https://drive.google.com/drive/folders/1F3FI_mp1Y1S-vUjjy6trIqcRzG2ZrPyj?usp=drive_link'),
      createSubject('ce_4139', 'Application Development Lab', '4th Semester', '4139', 'https://drive.google.com/drive/folders/1XZy6xr6iVUgzs25EUnirj6R0qOCnbM51?usp=drive_link'),
      createSubject('ce_4006', 'Minor Project', '4th Semester', '4006', 'https://drive.google.com/drive/folders/1DiosNnTlv2VYvKXvPosGBWSQ28uGSOkQ?usp=drive_link'),
      createSubject('ce_5009', 'Internship II', '4th Semester', '5009', 'https://drive.google.com/drive/folders/1HRM09uDQ4nFdbr0Atkd8FZkBkjMvo_c5?usp=drive_link'),
      // Semester 5
      createSubject('ce_5002', 'Project Management and Software Engineering', '5th Semester', '5002', 'https://drive.google.com/drive/folders/122jw2d3rpDSbwMOdeb1-MukoaAP5J9Of?usp=drive_link'),
      createSubject('ce_5131', 'Embedded System and RTOS', '5th Semester', '5131', 'https://drive.google.com/drive/folders/1wT3-3vWryRz0rLSA2IlKVOLSnyQGH7JX?usp=drive_link'),
      createSubject('ce_5132', 'Operating System', '5th Semester', '5132', 'https://drive.google.com/drive/folders/1cfIi9i8O5JPXdp2x-HJyfDP-yprdkn_h?usp=drive_link'),
      createSubject('ce_5133A', 'Virtualisation Technology and Cloud Computing', '5th Semester', '5133A', 'https://drive.google.com/drive/folders/1eDAfeTPt8FIEa76Z6bwiq9zLogYW6VTX?usp=drive_link'),
      createSubject('ce_5133B', 'Ethical Hacking', '5th Semester', '5133B', 'https://drive.google.com/drive/folders/1IPxPQ8xCGPt9XgjAmJlJuuo6ab7092rd?usp=drive_link'),
      createSubject('ce_5133C', 'AI and Machine Learning', '5th Semester', '5133C', 'https://drive.google.com/drive/folders/1tywK5a6j5CL7UXVBY8qOj42anIYn-2LZ?usp=drive_link'),
      createSubject('ce_5137', 'Embedded Systems and RTOS Lab', '5th Semester', '5137', 'https://drive.google.com/drive/folders/1vz_dKsqopLicEBPruFueOmOysVXDPHH2?usp=drive_link'),
      createSubject('ce_5138', 'System Administration Lab', '5th Semester', '5138', 'https://drive.google.com/drive/folders/16pLzVSoTTLMVtF3igbwdaDDIYnbaHpgF?usp=drive_link'),
      createSubject('ce_5139A', 'Virtualisation Technology and Cloud Computing Lab', '5th Semester', '5139A', 'https://drive.google.com/drive/folders/126gpUag0l6lSmlsklnhKuK_XqTUYlzOI?usp=drive_link'),
      createSubject('ce_5139B', 'Ethical Hacking Lab', '5th Semester', '5139B', 'https://drive.google.com/drive/folders/1v8zheaJJLG0TwN0hUIpeWxCCWz1kULeO?usp=drive_link'),
      createSubject('ce_5139C', 'AI & ML Lab', '5th Semester', '5139C', 'https://drive.google.com/drive/folders/1fM1mD8odVIMK4ltkAIeYmyG6ZvAbkndg?usp=drive_link'),
      createSubject('ce_5008', 'Seminar', '5th Semester', '5008', 'https://drive.google.com/drive/folders/19GfcoLIFi4Sl8zERt99HNcpZQrVrzeWn?usp=drive_link'),
      createSubject('ce_6009_s5', 'Major Project', '5th Semester', '6009', 'https://drive.google.com/drive/folders/1EFir2F-07KERBx7_rkMtEx7V8Nxyd-i7?usp=drive_link'),
      // Semester 6 (Normal)
      createSubject('ce_6001', 'Entrepreneurship and Startup', '6th Semester (Normal)', '6001', 'https://drive.google.com/drive/folders/1A60At1qsHqiPBOvl-1XHVyGXms8rbWNK?usp=drive_link'),
      createSubject('ce_6131A', 'Internet of Things', '6th Semester (Normal)', '6131A', 'https://drive.google.com/drive/folders/12ZlhEd40Mq0c67xJtro-W3Qw8Lt6OabM?usp=drive_link'),
      createSubject('ce_6131B', 'Server Administration', '6th Semester (Normal)', '6131B', 'https://drive.google.com/drive/folders/1xQU2rR5uiHdHQkcNFzX698Ut-U0Swz6W?usp=drive_link'),
      createSubject('ce_6131C', 'Software Testing', '6th Semester (Normal)', '6131C', 'https://drive.google.com/drive/folders/1YB1ozofBqho1UxQBHhZmk4mVS7QxLLr5?usp=drive_link'),
      createSubject('ce_6131D', 'Introduction to 5G', '6th Semester (Normal)', '6131D', 'https://drive.google.com/drive/folders/1bXknKfFUA2jvsofEsbdaVwtLZhYXpBhv?usp=drive_link'),
      createSubject('ce_6132A', 'Introduction to IoT', '6th Semester (Normal)', '6132A', 'https://drive.google.com/drive/folders/1zW9ArZkzZp_K-hRHtKdAmi6hMJ8hK2Sl?usp=drive_link'),
      createSubject('ce_6132B', 'Fundamentals of Web Technology', '6th Semester (Normal)', '6132B', 'https://drive.google.com/drive/folders/13Qt4iZkVabUkCV2TloWcHzIjvLQq51J-?usp=drive_link'),
      createSubject('ce_6132C', 'Multimedia', '6th Semester (Normal)', '6132C', 'https://drive.google.com/drive/folders/1PrWZ7XCm7gDJjFC3XwMwYWXcdoykDbCE?usp=drive_link'),
      createSubject('ce_6132D', 'Cloud Computing', '6th Semester (Normal)', '6132D', 'https://drive.google.com/drive/folders/1VN-n8Mw52bMK4zXv5Cs-jHx2g8rDD75Z?usp=drive_link'),
      createSubject('ce_6002', 'Indian Constitution', '6th Semester (Normal)', '6002', 'https://drive.google.com/drive/folders/1j1jxAYDZeQcW5pnn3tR8pJluL_bN-NC0?usp=drive_link'),
      createSubject('ce_6137', 'Computer Network Engineering Lab', '6th Semester (Normal)', '6137', 'https://drive.google.com/drive/folders/18iSlkTsppCCSxBXmLmlSXvm8Z0HFPg06?usp=drive_link'),
      createSubject('ce_6138', 'Smart Device Programming Lab', '6th Semester (Normal)', '6138', 'https://drive.google.com/drive/folders/1BWqyegLbB-DAsxrDYAnNu-qhhPp_bsY9?usp=drive_link'),
      createSubject('ce_6139A', 'Internet of Things Lab', '6th Semester (Normal)', '6139A', 'https://drive.google.com/drive/folders/1TnIfOOl930vTZKJ6JMem8bqftfG8RUaQ?usp=drive_link'),
      createSubject('ce_6139B', 'Server Administration Lab', '6th Semester (Normal)', '6139B', 'https://drive.google.com/drive/folders/1jEGrwyW-tDaU9c5vlFaUJ1PLOxy2ibYf?usp=drive_link'),
      createSubject('ce_6139C', 'Software Testing Lab', '6th Semester (Normal)', '6139C', 'https://drive.google.com/drive/folders/12Hgz581cotRq1bHo722vXMOF18XfGzIm?usp=drive_link'),
      createSubject('ce_6009', 'Major Project', '6th Semester (Normal)', '6009', 'https://drive.google.com/drive/folders/1o8W913FM631eBZ3-9DtNus2lainKSLih?usp=drive_link'),
      // Semester 6 (Internship)
      createSubject('ce_6001_int', 'Entrepreneurship and Startup', '6th Semester (Internship)', '6001', 'https://drive.google.com/drive/folders/1B1j40X16zSWvZj2lEvt8eSgJ_UCaOsMH?usp=drive_link'),
      createSubject('ce_6002_int', 'Indian Constitution', '6th Semester (Internship)', '6002', 'https://drive.google.com/drive/folders/1BL_hE53keptdbqzeKVoC1YO4kn-Y8SN7?usp=drive_link'),
      createSubject('ce_6137_int', 'Computer Network Engineering Lab', '6th Semester (Internship)', '6137', 'https://drive.google.com/drive/folders/1veAOj9Lq_jtnSTB_MAO4bZYcyehqkVlf?usp=drive_link'),
      createSubject('ce_6138_int', 'Smart Device Programming Lab', '6th Semester (Internship)', '6138', 'https://drive.google.com/drive/folders/1K6LMrj9lywkcCCzN226RFQ81fLdOz5--?usp=drive_link'),
      createSubject('ce_6007', 'Internship', '6th Semester (Internship)', '6007', 'https://drive.google.com/drive/folders/1nF3vLQlZhwONF02DEucIPP-OwD6_kZdW?usp=drive_link'),
    ],
    videos: [
      { id: 'v_ce_math1_pl', title: 'Mathematics I (Playlist)', youtubeId: 'PL_lLjt3U0IrogQSJOuRaaf0wxGXJJGqJj', instructor: 'Various', duration: 'Playlist', semester: 'Semester 1', subjectId: 'ce_1002' },
      { id: 'v_ce1', title: 'Introduction to Computer Organization', youtubeId: 'CDqg67L4980', instructor: 'Neso Academy', duration: '15:00', semester: '3rd Semester', subjectId: 'ce_3131' },
      { id: 'v_ce2', title: 'React JS Crash Course', youtubeId: 'w7ejDZ8SWv8', instructor: 'Traversy Media', duration: '1:54:00', semester: '6th Semester (Normal)', subjectId: 'ce_6132B' },
      { id: 'v_ce3', title: 'OS Concepts: Deadlocks', youtubeId: 'rN6gZM3rP6I', instructor: 'Gate Smashers', duration: '20:00', semester: '5th Semester', subjectId: 'ce_5132' },
    ]
  },
  {
    id: 'che',
    name: 'Computer Hardware Eng.',
    description: 'Design, development, and testing of computer systems and components.',
    icon: <Cpu className="w-8 h-8" />,
    color: 'bg-indigo-500',
    subjects: [], // ... existing subjects
    videos: []
  },
  {
    id: 'bme',
    name: 'Biomedical Eng.',
    description: 'Intersection of engineering principles and medical sciences.',
    icon: <Activity className="w-8 h-8" />,
    color: 'bg-rose-500',
    subjects: [],
    videos: []
  },
  {
    id: 'eee',
    name: 'Electrical & Electronics',
    description: 'Power generation, electrical systems, and machinery control.',
    icon: <Zap className="w-8 h-8" />,
    color: 'bg-yellow-500',
    subjects: [],
    videos: []
  },
  {
    id: 'ele', // Renamed from 'ece'
    name: 'Electronics Eng.',
    description: 'Electronic circuits, devices, telecommunications, and signal processing.',
    icon: <Radio className="w-8 h-8" />,
    color: 'bg-fuchsia-500',
    subjects: [],
    videos: []
  },
  {
    id: 'cng', // Renamed from 'civil'
    name: 'Civil Engineering',
    description: 'Design, construction, and maintenance of the physical and built environment.',
    icon: <HardHat className="w-8 h-8" />,
    color: 'bg-stone-500',
    subjects: [],
    videos: []
  },
  {
    id: 'mech',
    name: 'Mechanical Eng.',
    description: 'Mechanics, dynamics, thermodynamics, and manufacturing systems.',
    icon: <Wrench className="w-8 h-8" />,
    color: 'bg-orange-500',
    subjects: [],
    videos: []
  },
  {
    id: 'ame', // Renamed from 'auto'
    name: 'Automobile Eng.',
    description: 'Vehicle engineering, including mechanical, electrical, and safety aspects.',
    icon: <Car className="w-8 h-8" />,
    color: 'bg-red-500',
    subjects: [],
    videos: []
  }
];
