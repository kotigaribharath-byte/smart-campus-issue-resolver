import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import prisma from './config/prisma.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    console.log('🌱 Starting comprehensive database seed for CampusFix (PostgreSQL via Prisma)...');

    // Clean up existing database tables in relational order
    await prisma.feedback.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.issueUpdate.deleteMany({});
    await prisma.issue.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.building.deleteMany({});
    await prisma.department.deleteMany({});

    console.log('🧹 Cleaned up existing database tables.');

    // 1. Create Departments
    const departmentData = [
      {
        name: 'Electrical Department',
        description: 'Handles power outages, lighting, switchboards, wiring, and electrical machinery.',
        categoryKey: 'Electrical',
      },
      {
        name: 'Plumbing Department',
        description: 'Maintains campus water supply, washroom pipelines, leaks, and drainage.',
        categoryKey: 'Plumbing',
      },
      {
        name: 'IT/Network Department',
        description: 'Campus Wi-Fi, Ethernet ports, server connectivity, routers, and lab computing.',
        categoryKey: 'Wi-Fi/Network',
      },
      {
        name: 'Maintenance Department',
        description: 'Civil repairs, classroom furniture, desks, podiums, doors, windows, and structural fixes.',
        categoryKey: 'Furniture',
      },
      {
        name: 'Cleaning & Housekeeping',
        description: 'Restroom hygiene, classroom sanitization, trash clearance, and corridor cleaning.',
        categoryKey: 'Cleanliness',
      },
      {
        name: 'Security Department',
        description: 'CCTV surveillance, entry gates, campus patrol, key management, and emergency response.',
        categoryKey: 'Security',
      },
      {
        name: 'Laboratory Equipment',
        description: 'Specialized lab instruments, physics/chemistry test benches, and mechanical devices.',
        categoryKey: 'Laboratory Equipment',
      },
      {
        name: 'General Campus Services',
        description: 'General campus facilities, notices, grounds maintenance, and general requests.',
        categoryKey: 'Other',
      },
    ];

    const departments = [];
    for (const d of departmentData) {
      const created = await prisma.department.create({ data: d });
      departments.push(created);
    }
    console.log(` Created ${departments.length} departments.`);

    const deptMap = {};
    departments.forEach((d) => {
      deptMap[d.name] = d.id;
    });

    // 2. Create Buildings
    const buildingData = [
      {
        name: 'Main Academic Block (MAB)',
        block: 'Central Wing',
        floors: ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor'],
        description: 'Primary lecture theatres, dean offices, and registrar.',
      },
      {
        name: 'Science & Technology Centre (STC)',
        block: 'Tech Block A',
        floors: ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor'],
        description: 'Physics, Chemistry, and Biotech laboratories with smart seminar halls.',
      },
      {
        name: 'Engineering Block B (CSE & ECE)',
        block: 'West Block',
        floors: ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor'],
        description: 'Computer Science labs, AI research centre, and hardware engineering facilities.',
      },
      {
        name: 'Aryabhatta Central Library',
        block: 'North Campus',
        floors: ['Ground Floor', '1st Floor', '2nd Floor'],
        description: 'Digital reading rooms, book stacks, study carrels, and archive rooms.',
      },
      {
        name: 'Campus Dining & Student Activity Centre (SAC)',
        block: 'South Quad',
        floors: ['Ground Floor', '1st Floor'],
        description: 'Student cafeteria, gym, indoor badminton court, and club rooms.',
      },
      {
        name: 'Boys & Girls Resident Hostels (Block 1-4)',
        block: 'Hostel Enclave',
        floors: ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor', '5th Floor'],
        description: 'Student dormitories, laundry areas, common study lounges, and mess hall.',
      },
    ];

    const buildings = [];
    for (const b of buildingData) {
      const created = await prisma.building.create({ data: b });
      buildings.push(created);
    }
    console.log(` Created ${buildings.length} campus buildings.`);

    // 3. Create Demo Users
    const salt = await bcrypt.genSalt(10);
    const adminPassHash = await bcrypt.hash('Admin@123', salt);
    const staffPassHash = await bcrypt.hash('Staff@123', salt);
    const studentPassHash = await bcrypt.hash('Student@123', salt);

    // Admin
    const adminUser = await prisma.user.create({
      data: {
        name: 'Campus Admin (Dr. Mitchell)',
        email: 'admin@campusfix.edu',
        password: adminPassHash,
        role: 'admin',
        phone: '+1 (555) 019-2831',
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        active: true,
      },
    });

    // Staff Members
    const staffMembersData = [
      {
        name: 'Alex Vance (Electrician Staff)',
        email: 'staff.elec@campusfix.edu',
        password: staffPassHash,
        role: 'staff',
        phone: '+1 (555) 234-5678',
        staffId: 'STF-ELEC-01',
        departmentId: deptMap['Electrical Department'],
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      },
      {
        name: 'Priya Sharma (Network Staff)',
        email: 'staff.it@campusfix.edu',
        password: staffPassHash,
        role: 'staff',
        phone: '+1 (555) 345-6789',
        staffId: 'STF-NET-02',
        departmentId: deptMap['IT/Network Department'],
        profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      },
      {
        name: 'Rajesh Kumar (Plumbing Staff)',
        email: 'staff.plumb@campusfix.edu',
        password: staffPassHash,
        role: 'staff',
        phone: '+1 (555) 456-7890',
        staffId: 'STF-PLUMB-03',
        departmentId: deptMap['Plumbing Department'],
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      },
      {
        name: 'Sarah Jenkins (Maintenance Staff)',
        email: 'maintenance.staff@campusfix.edu',
        password: staffPassHash,
        role: 'staff',
        phone: '+1 (555) 567-8901',
        staffId: 'STF-MAINT-04',
        departmentId: deptMap['Maintenance Department'],
        profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      },
      {
        name: 'David Okafor (Housekeeping Supervisor)',
        email: 'cleaning.staff@campusfix.edu',
        password: staffPassHash,
        role: 'staff',
        phone: '+1 (555) 678-9012',
        staffId: 'STF-CLEAN-05',
        departmentId: deptMap['Cleaning & Housekeeping'],
        profileImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      },
      // Also provide electrical.staff and network.staff aliases
      {
        name: 'Marcus Vance',
        email: 'electrical.staff@campusfix.edu',
        password: staffPassHash,
        role: 'staff',
        phone: '+1 (555) 234-5678',
        staffId: 'STF-ELEC-02',
        departmentId: deptMap['Electrical Department'],
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      },
      {
        name: 'Elena Rostova',
        email: 'network.staff@campusfix.edu',
        password: staffPassHash,
        role: 'staff',
        phone: '+1 (555) 345-6789',
        staffId: 'STF-NET-03',
        departmentId: deptMap['IT/Network Department'],
        profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      },
    ];

    const staffUsers = [];
    for (const s of staffMembersData) {
      const created = await prisma.user.create({ data: s });
      staffUsers.push(created);
    }
    console.log(` Created ${staffUsers.length} staff members.`);

    // 20 Student Accounts
    const studentNames = [
      'Aarav Patel (Student)', 'Priya Sharma', 'Lucas Bennett', 'Chloe Dupont', 'Daniel Kim',
      'Fatima Al-Mansoor', 'Ethan Wright', 'Sofia Rossi', 'Rohan Patel', 'Hannah Abbott',
      'Mateo Fernandez', 'Zara Khan', 'Liam O\'Connor', 'Aaliyah Jackson', 'Gabriel Santos',
      'Mei Chen', 'Noah Schneider', 'Ananya Gupta', 'Kaito Tanaka', 'Amara Diallo',
    ];

    const studentUsers = [];
    for (let i = 0; i < studentNames.length; i++) {
      const name = studentNames[i];
      const email = `student${i + 1}@campusfix.edu`;
      const studentId = `STU-2026-${String(1001 + i)}`;

      const created = await prisma.user.create({
        data: {
          name,
          email,
          password: studentPassHash,
          role: 'student',
          phone: `+1 (555) ${String(100 + i * 37).padStart(3, '0')}-${String(4000 + i * 19).slice(-4)}`,
          studentId,
          profileImage: `https://images.unsplash.com/photo-${1530000000000 + i * 123456}?w=150&auto=format&fit=crop&q=80`,
          active: true,
        },
      });
      studentUsers.push(created);
    }

    // Also create student@campusfix.edu alias
    const studentAlias = await prisma.user.create({
      data: {
        name: 'Alex Morgan',
        email: 'student@campusfix.edu',
        password: studentPassHash,
        role: 'student',
        phone: '+1 (555) 999-8888',
        studentId: 'STU-2026-1000',
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        active: true,
      },
    });
    studentUsers.unshift(studentAlias);

    console.log(` Created ${studentUsers.length} student accounts.`);

    // 4. Create 36 Realistic Issues
    const rawIssueTemplates = [
      {
        title: 'Ceiling Projector Blinking & HDMI Port Broken',
        description: 'The ceiling mount projector in Lecture Hall 301 keeps flickering off every 3 minutes. The wall-mounted HDMI port plate is loose and has a bent pin.',
        category: 'Electrical',
        priority: 'High',
        status: 'Assigned',
        buildingIndex: 0,
        floor: '3rd Floor',
        location: 'Lecture Hall 301, Smart Classroom',
        departmentName: 'Electrical Department',
        staffIndex: 0,
        imageUrls: ['https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80'],
        daysAgo: 2,
      },
      {
        title: 'Severe Water Leak Under Restroom Basins',
        description: 'Two of the four water taps have leaking supply pipes under the counters. Water is pooling across the floor causing a slip hazard.',
        category: 'Plumbing',
        priority: 'High',
        status: 'In Progress',
        buildingIndex: 0,
        floor: '2nd Floor',
        location: 'West Wing Men\'s Washroom',
        departmentName: 'Plumbing Department',
        staffIndex: 2,
        imageUrls: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80'],
        daysAgo: 1,
      },
      {
        title: 'Wi-Fi Access Point AP-W4 Offline During Labs',
        description: 'AP-W4 on the 3rd-floor ceiling is blinking red and student devices cannot authenticate to eduroam/Campus-Secure.',
        category: 'Wi-Fi/Network',
        priority: 'Critical',
        status: 'In Progress',
        buildingIndex: 2,
        floor: '3rd Floor',
        location: 'Computer Systems Lab 304',
        departmentName: 'IT/Network Department',
        staffIndex: 1,
        imageUrls: ['https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80'],
        daysAgo: 3,
      },
      {
        title: 'Damaged Wooden Desks with Exposed Screws',
        description: 'Three desks in the front row have splintered wood and exposed screw threads that tore a student\'s backpack and could cause injury.',
        category: 'Furniture',
        priority: 'Medium',
        status: 'Resolved',
        buildingIndex: 0,
        floor: '1st Floor',
        location: 'Classroom 104',
        departmentName: 'Maintenance Department',
        staffIndex: 3,
        imageUrls: ['https://images.unsplash.com/photo-1588072432836-e10032774350?w=600&auto=format&fit=crop&q=80'],
        daysAgo: 5,
        resolvedDaysAgo: 1,
        rating: 5,
        ratingComment: 'Fixed super fast! The carpenter replaced the top plank cleanly.',
      },
      {
        title: 'Library Quiet Zone AC Unit Making Loud Grinding Noise',
        description: 'The ceiling HVAC unit in the 2nd Floor reading zone is vibrating violently with a loud metallic squeal.',
        category: 'Air Conditioning',
        priority: 'High',
        status: 'Submitted',
        buildingIndex: 3,
        floor: '2nd Floor',
        location: 'Silent Research Section, Cubicle 12-24',
        departmentName: 'Electrical Department',
        staffIndex: null,
        imageUrls: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80'],
        daysAgo: 0,
      },
      {
        title: 'Overflowing Trash Bins & Spilled Drinks Near Cafeteria Entrance',
        description: 'Recycling and compost bins are overflowing and sodas spilled across the main foyer floor creating a sticky mess.',
        category: 'Cleanliness',
        priority: 'Medium',
        status: 'Resolved',
        buildingIndex: 4,
        floor: 'Ground Floor',
        location: 'SAC Central Atrium Entrance',
        departmentName: 'Cleaning & Housekeeping',
        staffIndex: 4,
        imageUrls: ['https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=600&auto=format&fit=crop&q=80'],
        daysAgo: 4,
        resolvedDaysAgo: 3,
        rating: 5,
        ratingComment: 'Very prompt cleaning staff. Floor was mopped and sanitized within 2 hours.',
      },
      {
        title: 'Flickering LED Panels in Biotech Wet Lab',
        description: 'The overhead lighting fixtures in Bay 2 are rapidly strobing, interfering with microscope observation work.',
        category: 'Electrical',
        priority: 'Medium',
        status: 'Assigned',
        buildingIndex: 1,
        floor: '2nd Floor',
        location: 'Biotechnology Wet Lab 202',
        departmentName: 'Electrical Department',
        staffIndex: 0,
        imageUrls: ['https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80'],
        daysAgo: 2,
      },
      {
        title: 'Centrifuge Machine Error Code E-04 Unbalanced Rotor',
        description: 'High-speed centrifuge unit #3 consistently errors out with vibration alert E-04 upon reaching 4000 RPM.',
        category: 'Laboratory Equipment',
        priority: 'High',
        status: 'Submitted',
        buildingIndex: 1,
        floor: '1st Floor',
        location: 'Analytical Chemistry Core 108',
        departmentName: 'Laboratory Equipment',
        staffIndex: null,
        imageUrls: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=80'],
        daysAgo: 1,
      },
      {
        title: 'Main Emergency Exit Door Magnetic Lock Jammed',
        description: 'The push-bar emergency exit door on the east side does not release properly when pushed.',
        category: 'Security',
        priority: 'Critical',
        status: 'In Progress',
        buildingIndex: 2,
        floor: 'Ground Floor',
        location: 'East Emergency Stairwell',
        departmentName: 'Security Department',
        staffIndex: 3,
        imageUrls: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=80'],
        daysAgo: 1,
      },
      {
        title: 'Hostel 3 Hot Water Geyser Tripping Circuit Breaker',
        description: 'Turning on the 3rd floor geyser causes the floor MCB to trip instantly, leaving 20 rooms without morning hot water.',
        category: 'Electrical',
        priority: 'High',
        status: 'Resolved',
        buildingIndex: 5,
        floor: '3rd Floor',
        location: 'Hostel Block 3, North Washroom',
        departmentName: 'Electrical Department',
        staffIndex: 0,
        imageUrls: ['https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=600&auto=format&fit=crop&q=80'],
        daysAgo: 6,
        resolvedDaysAgo: 4,
        rating: 4,
        ratingComment: 'Replaced the short-circuited heating element.',
      },
      {
        title: 'Water Cooler Dispensing Murky Brownish Water',
        description: 'The drinking water fountain on the 1st floor is dispensing cloudy water with iron sediment.',
        category: 'Plumbing',
        priority: 'High',
        status: 'Reopened',
        buildingIndex: 0,
        floor: '1st Floor',
        location: 'Corridor Water Station #2',
        departmentName: 'Plumbing Department',
        staffIndex: 2,
        imageUrls: ['https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&auto=format&fit=crop&q=80'],
        daysAgo: 8,
        reopenReason: 'Water tasted fine for one day but brownish discoloration returned this morning.',
      },
      {
        title: 'Ethernet Wall Port Broken in Seminar Hall',
        description: 'The RJ-45 jack on the presenter podium is physically crushed; guest speakers cannot connect to the campus LAN.',
        category: 'Wi-Fi/Network',
        priority: 'Medium',
        status: 'Resolved',
        buildingIndex: 1,
        floor: 'Ground Floor',
        location: 'Auditorium 101 Podium',
        departmentName: 'IT/Network Department',
        staffIndex: 1,
        imageUrls: ['https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80'],
        daysAgo: 7,
        resolvedDaysAgo: 5,
        rating: 5,
        ratingComment: 'Re-terminated the CAT6 cable and replaced the wall plate.',
      },
    ];

    // Generate remaining issues to total 36 realistic issues
    const categoriesPool = ['Electrical', 'Plumbing', 'Wi-Fi/Network', 'Furniture', 'Air Conditioning', 'Cleanliness', 'Laboratory Equipment', 'Security', 'Other'];
    const prioritiesPool = ['Low', 'Medium', 'High', 'Critical'];
    const statusesPool = ['Submitted', 'Assigned', 'In Progress', 'On Hold', 'Resolved', 'Closed'];

    const extraIssues = [];
    for (let i = 13; i <= 36; i++) {
      const cat = categoriesPool[i % categoriesPool.length];
      const pri = prioritiesPool[i % prioritiesPool.length];
      const stat = statusesPool[i % statusesPool.length];
      const bIdx = i % buildings.length;
      const sIdx = i % staffUsers.length;

      let deptName = 'Electrical Department';
      if (cat === 'Plumbing') deptName = 'Plumbing Department';
      else if (cat === 'Wi-Fi/Network') deptName = 'IT/Network Department';
      else if (cat === 'Furniture') deptName = 'Maintenance Department';
      else if (cat === 'Cleanliness') deptName = 'Cleaning & Housekeeping';
      else if (cat === 'Security') deptName = 'Security Department';
      else if (cat === 'Laboratory Equipment') deptName = 'Laboratory Equipment';
      else deptName = 'General Campus Services';

      extraIssues.push({
        title: `Campus Infrastructure Maintenance Request #${100 + i} (${cat})`,
        description: `Routine inspection item reported regarding ${cat.toLowerCase()} in ${buildings[bIdx].name}. Requires technician inspection and status tracking.`,
        category: cat,
        priority: pri,
        status: stat,
        buildingIndex: bIdx,
        floor: `${(i % 4) + 1}st Floor`,
        location: `Room ${(i % 4) + 1}0${(i % 8) + 1}`,
        departmentName: deptName,
        staffIndex: stat === 'Submitted' ? null : sIdx,
        imageUrls: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80'],
        daysAgo: (i % 14) + 1,
        resolvedDaysAgo: stat === 'Resolved' || stat === 'Closed' ? Math.max(0, (i % 7)) : null,
        rating: (stat === 'Resolved' || stat === 'Closed') && (i % 2 === 0) ? (4 + (i % 2)) : null,
        ratingComment: (stat === 'Resolved' || stat === 'Closed') && (i % 2 === 0) ? 'Work was executed professionally and promptly.' : null,
      });
    }

    const allIssueTemplates = [...rawIssueTemplates, ...extraIssues];
    let seq = 1;

    for (let idx = 0; idx < allIssueTemplates.length; idx++) {
      const t = allIssueTemplates[idx];
      const complaintId = `CFX-2026-${String(seq).padStart(4, '0')}`;
      seq += 1;

      const studentUser = studentUsers[idx % studentUsers.length];
      const buildingObj = buildings[t.buildingIndex];
      const deptId = deptMap[t.departmentName] || departments[0].id;
      const assignedStaff = t.staffIndex !== null && staffUsers[t.staffIndex] ? staffUsers[t.staffIndex] : null;

      const createdDate = new Date();
      createdDate.setDate(createdDate.getDate() - t.daysAgo);
      createdDate.setHours(9 + (idx % 8), (idx * 17) % 60);

      let resolvedDate = null;
      if (t.status === 'Resolved' || t.status === 'Closed') {
        resolvedDate = new Date(createdDate);
        resolvedDate.setDate(resolvedDate.getDate() + (t.daysAgo - (t.resolvedDaysAgo || 0)));
        resolvedDate.setHours(16, 30);
      }

      const issue = await prisma.issue.create({
        data: {
          complaintId,
          title: t.title,
          description: t.description,
          category: t.category,
          priority: t.priority,
          status: t.status,
          buildingId: buildingObj.id,
          floor: t.floor,
          location: t.location,
          imageUrls: t.imageUrls,
          reportedById: studentUser.id,
          assignedToId: assignedStaff ? assignedStaff.id : null,
          departmentId: deptId,
          resolvedAt: resolvedDate,
          reopenCount: t.status === 'Reopened' ? 1 : 0,
          createdAt: createdDate,
          updatedAt: resolvedDate || createdDate,
        },
      });

      // Timeline entries
      await prisma.issueUpdate.create({
        data: {
          issueId: issue.id,
          updatedById: studentUser.id,
          previousStatus: '',
          newStatus: 'Submitted',
          comment: 'Complaint officially registered by student in the portal.',
          actionType: 'created',
          createdAt: createdDate,
        },
      });

      if (assignedStaff) {
        const assignDate = new Date(createdDate);
        assignDate.setHours(assignDate.getHours() + 1);

        await prisma.issueUpdate.create({
          data: {
            issueId: issue.id,
            updatedById: adminUser.id,
            previousStatus: 'Submitted',
            newStatus: 'Assigned',
            comment: `Assigned to ${t.departmentName} (${assignedStaff.name}).`,
            actionType: 'assigned',
            createdAt: assignDate,
          },
        });
      }

      if (['In Progress', 'On Hold', 'Resolved', 'Closed', 'Reopened'].includes(t.status) && assignedStaff) {
        const progressDate = new Date(createdDate);
        progressDate.setHours(progressDate.getHours() + 3);

        await prisma.issueUpdate.create({
          data: {
            issueId: issue.id,
            updatedById: assignedStaff.id,
            previousStatus: 'Assigned',
            newStatus: 'In Progress',
            comment: 'Technician arrived on site, diagnostics initiated.',
            actionType: 'status_change',
            createdAt: progressDate,
          },
        });
      }

      if (t.status === 'Resolved' || t.status === 'Closed') {
        await prisma.issueUpdate.create({
          data: {
            issueId: issue.id,
            updatedById: assignedStaff ? assignedStaff.id : adminUser.id,
            previousStatus: 'In Progress',
            newStatus: 'Resolved',
            comment: 'Maintenance repairs completed and tested verified working.',
            actionType: 'resolved',
            createdAt: resolvedDate,
          },
        });

        if (t.rating) {
          const feedbackDate = new Date(resolvedDate);
          feedbackDate.setHours(feedbackDate.getHours() + 2);

          await prisma.feedback.create({
            data: {
              issueId: issue.id,
              studentId: studentUser.id,
              rating: t.rating,
              comment: t.ratingComment || 'Very satisfied with the quick resolution.',
              createdAt: feedbackDate,
            },
          });

          await prisma.issueUpdate.create({
            data: {
              issueId: issue.id,
              updatedById: studentUser.id,
              previousStatus: 'Resolved',
              newStatus: 'Resolved',
              comment: `Student rated resolution: ${t.rating}/5 Stars. "${t.ratingComment || 'Resolved cleanly'}"`,
              actionType: 'feedback',
              createdAt: feedbackDate,
            },
          });
        }
      }

      if (t.status === 'Reopened') {
        const reopenDate = new Date();
        await prisma.issueUpdate.create({
          data: {
            issueId: issue.id,
            updatedById: studentUser.id,
            previousStatus: 'Resolved',
            newStatus: 'Reopened',
            comment: t.reopenReason || 'Issue re-occurred shortly after initial repair.',
            actionType: 'reopened',
            createdAt: reopenDate,
          },
        });
      }

      // Initial notification
      await prisma.notification.create({
        data: {
          userId: studentUser.id,
          issueId: issue.id,
          message: `Complaint #${complaintId} has been registered successfully.`,
          type: 'status_update',
          read: idx > 5,
          createdAt: createdDate,
        },
      });
    }

    console.log(` Created ${allIssueTemplates.length} realistic complaints with full timeline histories, notifications and ratings!`);
    console.log(' Demo database seeding completed successfully.');
  } catch (error) {
    console.error('❌ Error during PostgreSQL database seeding:', error);
    throw error;
  }
};
