from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from academics.models import Course, Semester, Subject
from books.models import Category, Book

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds academic courses (BCA, BCOM), 6 semesters each with 4-5 subjects, and 30 sample books'

    def handle(self, *args, **options):
        self.stdout.write("Starting academic structure and books seeding...")

        # 1. Categories
        cat_prog, _ = Category.objects.get_or_create(name='Programming & Software')
        cat_cs, _ = Category.objects.get_or_create(name='Computer Systems & Networking')
        cat_math, _ = Category.objects.get_or_create(name='Mathematics & Statistics')
        cat_acc, _ = Category.objects.get_or_create(name='Accounting & Finance')
        cat_mgmt, _ = Category.objects.get_or_create(name='Business & Management')
        cat_econ, _ = Category.objects.get_or_create(name='Economics & Law')

        # 2. Courses
        course_bca, _ = Course.objects.get_or_create(name='BCA (Bachelor of Computer Applications)')
        course_bcom, _ = Course.objects.get_or_create(name='BCOM (Bachelor of Commerce)')

        # Helper to create semesters
        bca_sems = {}
        for num in range(1, 7):
            sem, _ = Semester.objects.get_or_create(course=course_bca, number=num)
            bca_sems[num] = sem

        bcom_sems = {}
        for num in range(1, 7):
            sem, _ = Semester.objects.get_or_create(course=course_bcom, number=num)
            bcom_sems[num] = sem

        # 3. BCA Subjects (4-5 per semester)
        bca_subjects_data = {
            1: [
                ('BCA101', 'Programming in C'),
                ('BCA102', 'Computer Fundamentals'),
                ('BCA103', 'Mathematical Foundations'),
                ('BCA104', 'Communication and Soft Skills'),
                ('BCA105', 'Digital Electronics'),
            ],
            2: [
                ('BCA201', 'Data Structures using C'),
                ('BCA202', 'Object Oriented Programming with C++'),
                ('BCA203', 'Discrete Mathematics'),
                ('BCA204', 'Database Concepts'),
                ('BCA205', 'Environmental Studies'),
            ],
            3: [
                ('BCA301', 'Java Programming'),
                ('BCA302', 'Database Management Systems (DBMS)'),
                ('BCA303', 'Computer Networks'),
                ('BCA304', 'Operating Systems'),
                ('BCA305', 'Web Technologies & HTML/CSS'),
            ],
            4: [
                ('BCA401', 'Python Programming'),
                ('BCA402', 'Software Engineering'),
                ('BCA403', 'Computer Architecture'),
                ('BCA404', 'Web Development with JavaScript'),
            ],
            5: [
                ('BCA501', 'Data Science & Analytics'),
                ('BCA502', 'Cloud Computing Concepts'),
                ('BCA503', 'Cyber Security Essentials'),
                ('BCA504', 'Mobile App Development'),
            ],
            6: [
                ('BCA601', 'Machine Learning Basics'),
                ('BCA602', 'Internet of Things (IoT)'),
                ('BCA603', 'IT Project Management'),
                ('BCA604', 'Capstone Major Project'),
            ],
        }

        created_subjects = {}
        for sem_num, subjs in bca_subjects_data.items():
            for code, name in subjs:
                s, _ = Subject.objects.get_or_create(
                    semester=bca_sems[sem_num],
                    code=code,
                    defaults={'name': name}
                )
                created_subjects[code] = s

        # 4. BCOM Subjects (4 per semester)
        bcom_subjects_data = {
            1: [
                ('BCOM101', 'Financial Accounting - I'),
                ('BCOM102', 'Business Organization & Management'),
                ('BCOM103', 'Microeconomics'),
                ('BCOM104', 'Business Communication'),
            ],
            2: [
                ('BCOM201', 'Financial Accounting - II'),
                ('BCOM202', 'Macroeconomics'),
                ('BCOM203', 'Business Law & Regulatory Framework'),
                ('BCOM204', 'Business Mathematics'),
            ],
            3: [
                ('BCOM301', 'Corporate Accounting'),
                ('BCOM302', 'Company Law'),
                ('BCOM303', 'Principles of Marketing'),
                ('BCOM304', 'Business Statistics'),
            ],
            4: [
                ('BCOM401', 'Cost Accounting'),
                ('BCOM402', 'Income Tax Law and Practice'),
                ('BCOM403', 'Financial Management'),
                ('BCOM404', 'E-Commerce & Digital Business'),
            ],
            5: [
                ('BCOM501', 'Management Accounting'),
                ('BCOM502', 'Auditing and Corporate Governance'),
                ('BCOM503', 'Goods and Services Tax (GST)'),
                ('BCOM504', 'Fundamentals of Investment'),
            ],
            6: [
                ('BCOM601', 'International Business'),
                ('BCOM602', 'Banking and Financial Services'),
                ('BCOM603', 'Consumer Affairs & Protection'),
                ('BCOM604', 'Business Research Methods'),
            ],
        }

        for sem_num, subjs in bcom_subjects_data.items():
            for code, name in subjs:
                s, _ = Subject.objects.get_or_create(
                    semester=bcom_sems[sem_num],
                    code=code,
                    defaults={'name': name}
                )
                created_subjects[code] = s

        # 5. 30 Sample Books
        books_catalog = [
            # BCA Sem 1
            {
                'title': 'The C Programming Language (2nd Edition)',
                'author': 'Brian W. Kernighan, Dennis M. Ritchie',
                'isbn': '978-0131103627',
                'category': cat_prog,
                'subject': created_subjects['BCA101'],
                'publisher': 'Prentice Hall',
                'year': 2018,
                'total': 8,
                'avail': 6,
                'desc': 'The definitive guide to ANSI standard C programming by the designers of the language.'
            },
            {
                'title': 'Programming in ANSI C',
                'author': 'E. Balagurusamy',
                'isbn': '978-9353165130',
                'category': cat_prog,
                'subject': created_subjects['BCA101'],
                'publisher': 'McGraw Hill India',
                'year': 2019,
                'total': 12,
                'avail': 10,
                'desc': 'Comprehensive textbook explaining C programming syntax, arrays, pointers, and memory management for undergrads.'
            },
            {
                'title': 'Computer Fundamentals: Concepts, Systems & Applications',
                'author': 'P.K. Sinha, Priti Sinha',
                'isbn': '978-8176567527',
                'category': cat_cs,
                'subject': created_subjects['BCA102'],
                'publisher': 'BPB Publications',
                'year': 2020,
                'total': 10,
                'avail': 7,
                'desc': 'Core fundamental textbook covering CPU architecture, memory hierarchies, input/output peripherals, and number systems.'
            },
            {
                'title': 'Discrete Mathematics and Its Applications',
                'author': 'Kenneth H. Rosen',
                'isbn': '978-0073383095',
                'category': cat_math,
                'subject': created_subjects['BCA103'],
                'publisher': 'McGraw Hill',
                'year': 2021,
                'total': 6,
                'avail': 4,
                'desc': 'Precise introduction to mathematical reasoning, sets, logic, relations, graphs, and combinatorial algorithms.'
            },
            {
                'title': 'Digital Logic and Computer Design',
                'author': 'M. Morris Mano',
                'isbn': '978-9332542525',
                'category': cat_cs,
                'subject': created_subjects['BCA105'],
                'publisher': 'Pearson Education',
                'year': 2017,
                'total': 7,
                'avail': 5,
                'desc': 'Foundational textbook on Boolean algebra, logic gates, combinational circuits, flip-flops, and sequential counters.'
            },

            # BCA Sem 2
            {
                'title': 'Data Structures Using C and C++',
                'author': 'Yedidyah Langsam, Moshe J. Augenstein, Aaron M. Tenenbaum',
                'isbn': '978-9332549319',
                'category': cat_prog,
                'subject': created_subjects['BCA201'],
                'publisher': 'Pearson',
                'year': 2019,
                'total': 10,
                'avail': 8,
                'desc': 'In-depth coverage of stacks, queues, linked lists, binary search trees, hashing, and sorting algorithms.'
            },
            {
                'title': 'Object-Oriented Programming with C++',
                'author': 'E. Balagurusamy',
                'isbn': '978-9389949186',
                'category': cat_prog,
                'subject': created_subjects['BCA202'],
                'publisher': 'McGraw Hill',
                'year': 2020,
                'total': 14,
                'avail': 11,
                'desc': 'Standard university syllabus guide covering classes, inheritance, polymorphism, templates, and operator overloading.'
            },
            {
                'title': 'Fundamentals of Database Systems',
                'author': 'Ramez Elmasri, Shamkant B. Navathe',
                'isbn': '978-0133970777',
                'category': cat_cs,
                'subject': created_subjects['BCA204'],
                'publisher': 'Pearson',
                'year': 2021,
                'total': 9,
                'avail': 6,
                'desc': 'Complete introduction to relational database modeling, ER diagrams, SQL queries, and normalization techniques.'
            },

            # BCA Sem 3
            {
                'title': 'Java: The Complete Reference (12th Edition)',
                'author': 'Herbert Schildt',
                'isbn': '978-1260463415',
                'category': cat_prog,
                'subject': created_subjects['BCA301'],
                'publisher': 'McGraw Hill',
                'year': 2021,
                'total': 15,
                'avail': 12,
                'desc': 'Authoritative reference book covering Java SE syntax, multithreading, collections framework, and I/O streams.'
            },
            {
                'title': 'Database System Concepts (7th Edition)',
                'author': 'Abraham Silberschatz, Henry F. Korth, S. Sudarshan',
                'isbn': '978-0078022159',
                'category': cat_cs,
                'subject': created_subjects['BCA302'],
                'publisher': 'McGraw Hill',
                'year': 2020,
                'total': 10,
                'avail': 7,
                'desc': 'Classic reference for transaction processing, concurrency control, ACID properties, indexing, and query optimization.'
            },
            {
                'title': 'Computer Networks (6th Edition)',
                'author': 'Andrew S. Tanenbaum, David J. Wetherall',
                'isbn': '978-0137523214',
                'category': cat_cs,
                'subject': created_subjects['BCA303'],
                'publisher': 'Pearson',
                'year': 2021,
                'total': 8,
                'avail': 5,
                'desc': 'Detailed textbook explaining OSI and TCP/IP protocol layers, routing, congestion control, and socket programming.'
            },
            {
                'title': 'Operating System Concepts (10th Edition)',
                'author': 'Abraham Silberschatz, Peter B. Galvin, Greg Gagne',
                'isbn': '978-1119800361',
                'category': cat_cs,
                'subject': created_subjects['BCA304'],
                'publisher': 'Wiley',
                'year': 2020,
                'total': 10,
                'avail': 8,
                'desc': 'Known as the Dinosaur book, covering process scheduling, deadlock mitigation, virtual memory, and file systems.'
            },

            # BCA Sem 4
            {
                'title': 'Python Crash Course: A Hands-On Guide',
                'author': 'Eric Matthes',
                'isbn': '978-1593279288',
                'category': cat_prog,
                'subject': created_subjects['BCA401'],
                'publisher': 'No Starch Press',
                'year': 2019,
                'total': 12,
                'avail': 9,
                'desc': 'Practical guide to Python fundamentals, data structures, automation scripts, and object-oriented architecture.'
            },
            {
                'title': 'Software Engineering: A Practitioner Approach',
                'author': 'Roger S. Pressman, Bruce R. Maxim',
                'isbn': '978-9353165710',
                'category': cat_cs,
                'subject': created_subjects['BCA402'],
                'publisher': 'McGraw Hill',
                'year': 2020,
                'total': 7,
                'avail': 5,
                'desc': 'Industry standard guide covering Agile methodologies, SDLC stages, design patterns, testing, and maintenance.'
            },
            {
                'title': 'Computer Organization and Architecture',
                'author': 'William Stallings',
                'isbn': '978-0134997193',
                'category': cat_cs,
                'subject': created_subjects['BCA403'],
                'publisher': 'Pearson',
                'year': 2021,
                'total': 6,
                'avail': 4,
                'desc': 'Comprehensive analysis of RISC/CISC architectures, pipelining, cache memory structures, and bus architectures.'
            },

            # BCA Sem 5 & 6
            {
                'title': 'Python for Data Analysis (3rd Edition)',
                'author': 'Wes McKinney',
                'isbn': '978-1098104030',
                'category': cat_prog,
                'subject': created_subjects['BCA501'],
                'publisher': "O'Reilly Media",
                'year': 2022,
                'total': 8,
                'avail': 7,
                'desc': 'Written by the creator of pandas, explaining data wrangling, cleaning, analysis, and visualization in Python.'
            },
            {
                'title': 'Cloud Computing: Principles and Paradigms',
                'author': 'Rajkumar Buyya, James Broberg, Andrzej Goscinski',
                'isbn': '978-0470887998',
                'category': cat_cs,
                'subject': created_subjects['BCA502'],
                'publisher': 'Wiley',
                'year': 2018,
                'total': 5,
                'avail': 3,
                'desc': 'Detailed textbook explaining SaaS, PaaS, IaaS architectures, virtualization, and distributed server management.'
            },
            {
                'title': 'Cryptography and Network Security',
                'author': 'William Stallings',
                'isbn': '978-0134444284',
                'category': cat_cs,
                'subject': created_subjects['BCA503'],
                'publisher': 'Pearson',
                'year': 2020,
                'total': 6,
                'avail': 5,
                'desc': 'Essential textbook on symmetric cryptography, RSA, hash functions, digital signatures, and firewalls.'
            },
            {
                'title': 'Hands-On Machine Learning with Scikit-Learn, Keras & TensorFlow',
                'author': 'Aurelien Geron',
                'isbn': '978-1098125974',
                'category': cat_prog,
                'subject': created_subjects['BCA601'],
                'publisher': "O'Reilly Media",
                'year': 2022,
                'total': 7,
                'avail': 6,
                'desc': 'Modern practical guide to machine learning models, neural networks, classification, regression, and model deployment.'
            },

            # BCOM Sem 1
            {
                'title': 'Financial Accounting for B.Com',
                'author': 'T.S. Grewal, S.C. Gupta',
                'isbn': '978-8121905664',
                'category': cat_acc,
                'subject': created_subjects['BCOM101'],
                'publisher': 'S. Chand Publishing',
                'year': 2021,
                'total': 15,
                'avail': 11,
                'desc': 'Core textbook covering journal entries, ledger accounts, trial balance, depreciation accounting, and final accounts.'
            },
            {
                'title': 'Financial Accounting: Concepts and Applications',
                'author': 'P.C. Tulsian, Bharat Tulsian',
                'isbn': '978-9352535033',
                'category': cat_acc,
                'subject': created_subjects['BCOM101'],
                'publisher': 'Pearson India',
                'year': 2020,
                'total': 12,
                'avail': 9,
                'desc': 'Clear explanations of accounting standards, bank reconciliation statements, and partnership accounts.'
            },
            {
                'title': 'Business Organization and Management',
                'author': 'C.B. Gupta',
                'isbn': '978-9351610472',
                'category': cat_mgmt,
                'subject': created_subjects['BCOM102'],
                'publisher': 'Sultan Chand & Sons',
                'year': 2019,
                'total': 10,
                'avail': 7,
                'desc': 'Detailed study of business enterprise structures, entrepreneurship, organizational planning, and delegation.'
            },
            {
                'title': 'Principles of Microeconomics',
                'author': 'N. Gregory Mankiw',
                'isbn': '978-0357133484',
                'category': cat_econ,
                'subject': created_subjects['BCOM103'],
                'publisher': 'Cengage Learning',
                'year': 2020,
                'total': 9,
                'avail': 6,
                'desc': 'World-renowned textbook explaining consumer behavior, supply and demand, elasticity, and market equilibrium.'
            },

            # BCOM Sem 2
            {
                'title': 'Advanced Accounting: Volume I',
                'author': 'M.C. Shukla, T.S. Grewal, S.C. Gupta',
                'isbn': '978-9352530144',
                'category': cat_acc,
                'subject': created_subjects['BCOM201'],
                'publisher': 'S. Chand Publishing',
                'year': 2020,
                'total': 11,
                'avail': 8,
                'desc': 'Comprehensive text for consignment accounts, joint ventures, branch accounts, and hire purchase systems.'
            },
            {
                'title': 'Macroeconomics: Theory and Policy',
                'author': 'H.L. Ahuja',
                'isbn': '978-9352837328',
                'category': cat_econ,
                'subject': created_subjects['BCOM202'],
                'publisher': 'S. Chand Publishing',
                'year': 2019,
                'total': 8,
                'avail': 6,
                'desc': 'Complete analysis of national income accounting, Keynesian theory, inflation, monetary policy, and fiscal measures.'
            },
            {
                'title': 'Business Law (Mercantile Law)',
                'author': 'N.D. Kapoor',
                'isbn': '978-9351611738',
                'category': cat_econ,
                'subject': created_subjects['BCOM203'],
                'publisher': 'Sultan Chand & Sons',
                'year': 2021,
                'total': 14,
                'avail': 10,
                'desc': 'Authoritative guide to Indian Contract Act 1872, Sale of Goods Act, Partnership Act, and Negotiable Instruments Act.'
            },

            # BCOM Sem 3
            {
                'title': 'Corporate Accounting for Undergraduates',
                'author': 'S.N. Maheshwari, S.K. Maheshwari',
                'isbn': '978-9352718719',
                'category': cat_acc,
                'subject': created_subjects['BCOM301'],
                'publisher': 'Vikas Publishing',
                'year': 2020,
                'total': 10,
                'avail': 7,
                'desc': 'Essential text on issue and redemption of shares, debentures, valuation of goodwill and shares, and amalgamation.'
            },
            {
                'title': 'Marketing Management (16th Edition)',
                'author': 'Philip Kotler, Kevin Lane Keller',
                'isbn': '978-0135887158',
                'category': cat_mgmt,
                'subject': created_subjects['BCOM303'],
                'publisher': 'Pearson',
                'year': 2021,
                'total': 9,
                'avail': 7,
                'desc': 'The benchmark marketing textbook exploring consumer research, 4Ps, brand positioning, and digital campaigns.'
            },

            # BCOM Sem 4 & 5
            {
                'title': 'Cost Accounting: Principles and Practice',
                'author': 'M.N. Arora',
                'isbn': '978-9352718726',
                'category': cat_acc,
                'subject': created_subjects['BCOM401'],
                'publisher': 'Vikas Publishing',
                'year': 2021,
                'total': 8,
                'avail': 5,
                'desc': 'Comprehensive text explaining material costing, labor variance, overhead distribution, and job/process costing.'
            },
            {
                'title': 'Financial Management: Theory and Practice',
                'author': 'Prasanna Chandra',
                'isbn': '978-9389949773',
                'category': cat_acc,
                'subject': created_subjects['BCOM403'],
                'publisher': 'McGraw Hill India',
                'year': 2020,
                'total': 11,
                'avail': 9,
                'desc': 'Flagship textbook on capital budgeting, cost of capital, working capital management, and dividend policies.'
            },
        ]

        created_books_count = 0
        for b_data in books_catalog:
            book, created = Book.objects.get_or_create(
                isbn=b_data['isbn'],
                defaults={
                    'title': b_data['title'],
                    'author': b_data['author'],
                    'category': b_data['category'],
                    'subject': b_data['subject'],
                    'publisher': b_data['publisher'],
                    'year': b_data['year'],
                    'total_copies': b_data['total'],
                    'available_copies': b_data['avail'],
                    'description': b_data['desc'],
                }
            )
            if created:
                created_books_count += 1

        self.stdout.write(self.style.SUCCESS(
            f"Successfully seeded {created_books_count} books across BCA and BCOM curricula (total in catalog: {Book.objects.count()})."
        ))

        # 6. Ensure default demo student exists for testing
        sem1_bca = bca_sems[1]
        demo_student_user, stu_created = User.objects.get_or_create(
            username='student',
            defaults={
                'email': 'student@library.edu',
                'first_name': 'Aarav',
                'last_name': 'Patel',
                'role': 'student',
                'enrollment_no': 'BCA2024001',
                'phone': '9876501234',
                'course': course_bca,
                'semester': sem1_bca,
            }
        )
        if stu_created:
            demo_student_user.set_password('student123')
            demo_student_user.save()
            self.stdout.write(self.style.SUCCESS("Created demo student: student / student123 (BCA Semester 1)"))
        else:
            # Ensure course and semester are set
            if not demo_student_user.semester:
                demo_student_user.course = course_bca
                demo_student_user.semester = sem1_bca
                demo_student_user.save()
            self.stdout.write(self.style.SUCCESS("Demo student 'student' is ready (BCA Semester 1)"))
