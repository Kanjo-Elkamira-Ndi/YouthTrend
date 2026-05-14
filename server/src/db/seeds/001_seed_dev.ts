/**
 * YouthTrend — Development Seed
 *
 * Creates realistic Cameroonian seed data for local development:
 *   - 1 super admin
 *   - 3 campuses (UY1, UB, IUBS)
 *   - 1 campus admin per campus
 *   - 1 moderator per campus
 *   - 5 writers per campus  (15 total)
 *   - 3 readers per campus  (9 total)
 *   - 4 posts per campus    (12 total)
 *   - Comments, claps, follows, bookmarks on some posts
 */

import { Pool, PoolClient } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { randomBytes, randomUUID, scrypt as scryptCallback } from 'crypto';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const HASH = bcrypt.hashSync('Password123!', 10);   // all seed users share this password
const PASSWORD = 'Password123!';

// ── Helpers ──────────────────────────────────────────────────────────────────

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function username(name: string, suffix = ''): string {
  return slug(name).replace(/-/g, '.') + suffix;
}

async function hashBetterAuthPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const key = await new Promise<Buffer>((resolve, reject) => {
    scryptCallback(password.normalize('NFKC'), salt, 64, {
      N:      16384,
      r:      16,
      p:      1,
      maxmem: 128 * 16384 * 16 * 2,
    }, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(derivedKey);
    });
  });

  return `${salt}:${key.toString('hex')}`;
}

async function upsertBetterAuthCredentialUser(
  client: PoolClient,
  input: {
    email:    string;
    name:     string;
    password: string;
    role:     'super_admin' | 'campus_admin';
    campusId?: string | null;
  },
): Promise<string> {
  const authUserId = randomUUID();
  const now = new Date();

  const { rows: [authUser] } = await client.query<{ id: string }>(`
    INSERT INTO "user"
      ("id", "name", "email", "emailVerified", "createdAt", "updatedAt", "campusId", "ytRole")
    VALUES
      ($1, $2, LOWER($3), TRUE, $4, $4, $5, $6)
    ON CONFLICT ("email") DO UPDATE SET
      "name"          = EXCLUDED."name",
      "emailVerified" = TRUE,
      "updatedAt"     = EXCLUDED."updatedAt",
      "campusId"      = EXCLUDED."campusId",
      "ytRole"        = EXCLUDED."ytRole"
    RETURNING "id"
  `, [
    authUserId,
    input.name,
    input.email,
    now,
    input.campusId ?? null,
    input.role,
  ]);

  const passwordHash = await hashBetterAuthPassword(input.password);

  await client.query(`
    DELETE FROM "account"
    WHERE "userId" = $1
      AND "providerId" = 'credential'
  `, [authUser.id]);

  await client.query(`
    INSERT INTO "account"
      ("id", "accountId", "providerId", "userId", "password", "createdAt", "updatedAt")
    VALUES
      ($1, $2, 'credential', $2, $3, $4, $4)
  `, [
    randomUUID(),
    authUser.id,
    passwordHash,
    now,
  ]);

  return authUser.id;
}

// ── Data ─────────────────────────────────────────────────────────────────────

const CAMPUSES = [
  {
    name: 'University of Yaoundé I',
    slug: 'uy1',
    short_code: 'UY1',
    description: 'The oldest and largest public university in Cameroon, located in Yaoundé.',
    allowed_domains: ['uy1.cm', 'uniyaounde1.cm'],
  },
  {
    name: 'University of Buea',
    slug: 'ub',
    short_code: 'UB',
    description: 'Cameroon\'s first Anglophone state university, located on the slopes of Mount Cameroon.',
    allowed_domains: ['ubuea.cm', 'ub.cm'],
  },
  {
    name: 'Yaounde International Business School',
    slug: 'iubs',
    short_code: 'IUBS',
    description: 'A leading business school in Yaoundé offering programmes in management and entrepreneurship.',
    allowed_domains: ['iubs.cm'],
  },
];

// Users per campus: [campus_admin, moderator, writer×5, reader×3]
const CAMPUS_USERS: Record<string, {
  admin:      { name: string; email: string };
  moderator:  { name: string; email: string };
  writers:    Array<{ name: string; email: string; department: string; year: number }>;
  readers:    Array<{ name: string; email: string }>;
}> = {
  UY1: {
    admin:     { name: 'Celestine Mbarga',  email: 'celestine.mbarga@uy1.cm' },
    moderator: { name: 'Rodrigue Fouda',    email: 'rodrigue.fouda@uy1.cm' },
    writers: [
      { name: 'Amara Ngono',      email: 'amara.ngono@uy1.cm',    department: 'Computer Science', year: 3 },
      { name: 'Chanceline Fouda', email: 'chanceline.fouda@uy1.cm', department: 'Law',            year: 4 },
      { name: 'Blaise Eyong',     email: 'blaise.eyong@uy1.cm',   department: 'Economics',        year: 2 },
      { name: 'Fatima Nkemdirim', email: 'fatima.nkem@uy1.cm',    department: 'Medicine',         year: 5 },
      { name: 'Parfait Tamba',    email: 'parfait.tamba@uy1.cm',  department: 'Engineering',      year: 3 },
    ],
    readers: [
      { name: 'Gaelle Atangana', email: 'gaelle.atangana@uy1.cm' },
      { name: 'Junior Nkodo',    email: 'junior.nkodo@uy1.cm' },
      { name: 'Merveille Biya',  email: 'merveille.biya@uy1.cm' },
    ],
  },
  UB: {
    admin:     { name: 'Viviane Ndoumbe',  email: 'viviane.ndoumbe@ubuea.cm' },
    moderator: { name: 'Eric Fomban',      email: 'eric.fomban@ubuea.cm' },
    writers: [
      { name: 'Kofi Mbarga',      email: 'kofi.mbarga@ubuea.cm',   department: 'Computer Engineering', year: 4 },
      { name: 'Nadège Kamdem',    email: 'nadege.kamdem@ubuea.cm', department: 'Business Admin',       year: 3 },
      { name: 'Wilfried Nguele',  email: 'wilfried.nguele@ubuea.cm', department: 'Mathematics',        year: 2 },
      { name: 'Stella Njike',     email: 'stella.njike@ubuea.cm',  department: 'Journalism',           year: 3 },
      { name: 'Armel Fotso',      email: 'armel.fotso@ubuea.cm',   department: 'Physics',              year: 1 },
    ],
    readers: [
      { name: 'Bertrand Manga',  email: 'bertrand.manga@ubuea.cm' },
      { name: 'Carine Eto\'o',   email: 'carine.etoo@ubuea.cm' },
      { name: 'Dieudonne Kom',   email: 'dieudonné.kom@ubuea.cm' },
    ],
  },
  IUBS: {
    admin:     { name: 'Sandrine Owono',  email: 'sandrine.owono@iubs.cm' },
    moderator: { name: 'Hermann Nkoa',   email: 'hermann.nkoa@iubs.cm' },
    writers: [
      { name: 'Hermine Bello',  email: 'hermine.bello@iubs.cm',   department: 'Marketing',    year: 2 },
      { name: 'Landry Essono',  email: 'landry.essono@iubs.cm',   department: 'Finance',      year: 3 },
      { name: 'Romuald Abena',  email: 'romuald.abena@iubs.cm',   department: 'HR Management', year: 4 },
      { name: 'Yvette Enow',    email: 'yvette.enow@iubs.cm',     department: 'Accounting',   year: 2 },
      { name: 'Christian Mvogo', email: 'christian.mvogo@iubs.cm', department: 'Entrepreneurship', year: 3 },
    ],
    readers: [
      { name: 'Laeticia Ndom',   email: 'laeticia.ndom@iubs.cm' },
      { name: 'Patrick Manga',   email: 'patrick.manga@iubs.cm' },
      { name: 'Sylvie Akono',    email: 'sylvie.akono@iubs.cm' },
    ],
  },
};

const POST_TEMPLATES = [
  {
    title:    'The Best Ndolé Spots Near Campus You Need to Try',
    category: 'gist',
    body:     `If you've been on campus long enough, you know that finding a good plate of ndolé at a reasonable price is practically a survival skill. After three years of rigorous field research (and many empty wallets), I've compiled the definitive guide to the best ndolé joints within walking distance of campus.\n\nFirst on the list is Mama Suzanne's spot near the main gate. Her version uses the freshest bitterleaf, and she never skimps on the crayfish. A full plate with plantain goes for just 800 FCFA — practically highway robbery in the best possible way.\n\nSecond is the canteen inside block B. Yes, the canteen. Don't sleep on it. The cook changes the recipe slightly on Thursdays and it becomes something genuinely special.\n\nFinally, for the adventurous among you, there's a woman who sets up a small folding table near the library on Tuesday and Friday afternoons. No name, no sign — just follow the smell. Worth every step.\n\nHave your own recommendations? Drop them in the comments and let's build the ultimate campus food guide together.`,
    visibility: 'campus_only',
    tags: ['food', 'campus-life', 'guide'],
  },
  {
    title:    'Five Free Resources Every CS Student Should Know About',
    category: 'academics',
    body:     `Being a Computer Science student in Cameroon means you often have to be creative with resources. Internet connectivity is inconsistent, textbooks are expensive, and lab time is limited. But the open internet has never been more generous — if you know where to look.\n\n1. CS50 by Harvard (edx.org) — The single best introduction to programming fundamentals, completely free. The problem sets will humble you, and that's the point.\n\n2. The Odin Project — Full-stack web development from absolute beginner to job-ready. Open source, community-driven, and entirely free.\n\n3. MIT OpenCourseWare — Full lecture notes, assignments, and exams from actual MIT courses. The algorithms courses alone are worth a semester of study.\n\n4. freeCodeCamp — 3,000+ hours of coding curriculum covering everything from HTML to machine learning. Each completed certification is actually recognised by some employers.\n\n5. GitHub Student Pack — If you have a .edu or university email, you qualify. Free access to tools like GitHub Pro, Figma, JetBrains IDEs, and more.\n\nSave this post. Share it with your coursemates. Knowledge shared is knowledge multiplied.`,
    visibility: 'public',
    tags: ['academics', 'tech', 'resources', 'cs'],
  },
  {
    title:    'Why Cameroonian Students Need to Start Taking Internships More Seriously',
    category: 'opinion',
    body:     `Let me say something that might be unpopular: a degree from a Cameroonian university, on its own, is no longer enough.\n\nI don't say this to discourage anyone. I say it because the labour market has shifted, and students who graduate with work experience are being hired at a rate that students without experience simply are not.\n\nThe internship culture on our campuses is still largely viewed as a formality — something you do to fulfil a school requirement, not something you pursue aggressively for your own development. This needs to change.\n\nHere's what I've observed from students who graduated in my faculty over the last two years: those who did at least two meaningful internships during their studies found employment within six months of graduation. Those who didn't are still searching, or are working in fields entirely unrelated to their degree.\n\nThe job market does not wait for you to be ready. You have to show up ready.\n\nSo here is my challenge to every student reading this: before you finish your degree, find at least two internships — even unpaid ones — in your field. Treat them seriously. Build relationships. Ask questions. The degree opens a door. The experience determines whether you can walk through it confidently.`,
    visibility: 'public',
    tags: ['opinion', 'career', 'internship'],
  },
  {
    title:    'Campus Election 2026 — What Every Student Voter Needs to Know',
    category: 'news',
    body:     `Student union elections are scheduled for the third week of May, and this year's race is looking more competitive than it has in years. Three tickets have declared their candidacy, and the platforms could not be more different.\n\nThe incumbent ticket, led by final-year student Fabrice Zang, is running on a continuity platform — citing improvements to the campus WiFi infrastructure and the new student dispensary as key achievements of the current administration.\n\nThe challenger ticket, headed by Bernadette Ngo, is pushing a more radical agenda: mandatory consultation of the student body before any fee increases, a campus-wide mental health programme, and open monthly meetings between student leadership and faculty management.\n\nA third independent ticket, the Unity Movement, is less formally organised but has been gaining traction on social media, particularly among first and second year students who feel neither of the main tickets represents them.\n\nVoting will take place across three polling stations on campus. All registered students are eligible to vote. Bring your student ID.\n\nWhoever wins, the most important thing is that you show up. Apathy is how bad leadership stays in power.`,
    visibility: 'campus_only',
    tags: ['news', 'elections', 'student-union'],
  },
];

// ── Seed function ─────────────────────────────────────────────────────────────

async function seed(client: PoolClient): Promise<void> {
  console.log('\n  Clearing existing seed data...');
  // Delete in reverse dependency order
  await client.query(`DELETE FROM audit_logs`);
  await client.query(`DELETE FROM notifications`);
  await client.query(`DELETE FROM writer_upgrade_requests`);
  await client.query(`DELETE FROM announcements`);
  await client.query(`DELETE FROM reports`);
  await client.query(`DELETE FROM bookmarks`);
  await client.query(`DELETE FROM follows`);
  await client.query(`DELETE FROM claps`);
  await client.query(`DELETE FROM comments`);
  await client.query(`DELETE FROM post_views`);
  await client.query(`DELETE FROM post_edits`);
  await client.query(`DELETE FROM post_tags`);
  await client.query(`DELETE FROM posts`);
  await client.query(`DELETE FROM refresh_tokens`);
  await client.query(`DELETE FROM password_resets`);
  await client.query(`DELETE FROM email_verifications`);
  await client.query(`DELETE FROM users WHERE role != 'super_admin'`);
  await client.query(`DELETE FROM campuses`);

  // ── Super admin ───────────────────────────────────────────────────────────
  console.log('  Creating super admin...');
  const superAdminAuthId = await upsertBetterAuthCredentialUser(client, {
    email:    'jordan@youthtrend.cm',
    name:     'Jordan Ndi',
    password: PASSWORD,
    role:     'super_admin',
  });

  const { rows: [superAdmin] } = await client.query<{ id: string }>(`
    INSERT INTO users
      (email, password_hash, full_name, username, role, status, better_auth_id)
    VALUES
      ($1, $2, $3, $4, 'super_admin', 'active', $5)
    ON CONFLICT (email) DO UPDATE SET
      password_hash = EXCLUDED.password_hash,
      status        = 'active',
      better_auth_id = EXCLUDED.better_auth_id
    RETURNING id
  `, ['jordan@youthtrend.cm', HASH, 'Jordan Ndi', 'jordan.ndi', superAdminAuthId]);

  console.log(`    Super admin id: ${superAdmin.id}`);

  // ── Campuses & users ──────────────────────────────────────────────────────
  for (const campus of CAMPUSES) {
    console.log(`\n  Seeding campus: ${campus.short_code}`);

    // Create campus
    const { rows: [c] } = await client.query<{ id: string }>(`
      INSERT INTO campuses (name, slug, short_code, description, allowed_domains)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [campus.name, campus.slug, campus.short_code, campus.description,
        campus.allowed_domains]);

    const campusId = c.id;
    const cu = CAMPUS_USERS[campus.short_code];

    // Campus admin
    const campusAdminAuthId = await upsertBetterAuthCredentialUser(client, {
      email:    cu.admin.email,
      name:     cu.admin.name,
      password: PASSWORD,
      role:     'campus_admin',
      campusId,
    });

    const { rows: [caRow] } = await client.query<{ id: string }>(`
      INSERT INTO users
        (campus_id, email, password_hash, full_name, username, role, status, better_auth_id)
      VALUES
        ($1, $2, $3, $4, $5, 'campus_admin', 'active', $6)
      RETURNING id
    `, [campusId, cu.admin.email, HASH, cu.admin.name,
        username(cu.admin.name, '.ca'), campusAdminAuthId]);
    console.log(`    Campus admin: ${cu.admin.name}`);

    // Moderator
    await client.query(`
      INSERT INTO users (campus_id, email, password_hash, full_name, username, role, status)
      VALUES ($1, $2, $3, $4, $5, 'moderator', 'active')
    `, [campusId, cu.moderator.email, HASH, cu.moderator.name,
        username(cu.moderator.name, '.mod')]);
    console.log(`    Moderator:    ${cu.moderator.name}`);

    // Writers
    const writerIds: string[] = [];
    for (const w of cu.writers) {
      const { rows: [wr] } = await client.query<{ id: string }>(`
        INSERT INTO users
          (campus_id, email, password_hash, full_name, username, role, status,
           department, year_of_study)
        VALUES ($1,$2,$3,$4,$5,'writer','active',$6,$7) RETURNING id
      `, [campusId, w.email, HASH, w.name, username(w.name),
          w.department, w.year]);
      writerIds.push(wr.id);
      console.log(`    Writer:       ${w.name}`);
    }

    // Readers
    for (const r of cu.readers) {
      await client.query(`
        INSERT INTO users
          (campus_id, email, password_hash, full_name, username, role, status)
        VALUES ($1,$2,$3,$4,$5,'reader','active')
      `, [campusId, r.email, HASH, r.name, username(r.name)]);
    }

    // Posts (one per template, attributed to rotating writers)
    const postIds: string[] = [];
    for (let i = 0; i < POST_TEMPLATES.length; i++) {
      const t  = POST_TEMPLATES[i];
      const authorId = writerIds[i % writerIds.length];
      const postSlug = `${slug(t.title)}-${Date.now()}-${i}`;

      const { rows: [p] } = await client.query<{ id: string }>(`
        INSERT INTO posts
          (author_id, campus_id, title, slug, body, category, status,
           visibility, published_at)
        VALUES ($1,$2,$3,$4,$5,$6,'published',$7,NOW() - ($8 || ' days')::INTERVAL)
        RETURNING id
      `, [authorId, campusId, t.title, postSlug, t.body, t.category,
          t.visibility, String(i * 3)]);

      postIds.push(p.id);

      // Tags
      for (const tag of t.tags) {
        await client.query(
          `INSERT INTO post_tags (post_id, tag) VALUES ($1, $2)`,
          [p.id, tag]
        );
      }

      // Claps from first two writers
      for (let ci = 0; ci < Math.min(2, writerIds.length); ci++) {
        if (writerIds[ci] !== authorId) {
          const clapCount = Math.floor(Math.random() * 45) + 5;
          await client.query(`
            INSERT INTO claps (user_id, post_id, count)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id, post_id) DO NOTHING
          `, [writerIds[ci], p.id, clapCount]);

          // Update denormalised counter
          await client.query(
            `UPDATE posts SET clap_count = clap_count + $1 WHERE id = $2`,
            [clapCount, p.id]
          );
        }
      }

      // One comment
      if (writerIds.length > 1) {
        const commenterId = writerIds[(i + 1) % writerIds.length];
        await client.query(`
          INSERT INTO comments (post_id, author_id, body)
          VALUES ($1, $2, $3)
        `, [p.id, commenterId,
            'Great piece! This is exactly what our campus community needs to discuss.']);

        await client.query(
          `UPDATE posts SET comment_count = comment_count + 1 WHERE id = $1`,
          [p.id]
        );
      }
    }

    // Follows — first writer follows second writer
    if (writerIds.length >= 2) {
      await client.query(`
        INSERT INTO follows (follower_id, following_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
      `, [writerIds[0], writerIds[1]]);
    }

    // Campus announcement
    await client.query(`
      INSERT INTO announcements
        (campus_id, author_id, title, body, visibility, is_pinned)
      VALUES ($1, $2, $3, $4, 'all_students', TRUE)
    `, [
      campusId,
      caRow.id,
      `Welcome to YouthTrend — ${campus.short_code} Campus`,
      `We are excited to officially launch YouthTrend on the ${campus.name} campus. ` +
      `This platform is your space to share news, gist, opinions, and announcements. ` +
      `Writers — start publishing. Readers — start clapping. Let's build something great together.`,
    ]);
  }
}

// ── Run ───────────────────────────────────────────────────────────────────────

async function run(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await seed(client);
    await client.query('COMMIT');
    console.log('\n  Seed completed successfully.\n');
    console.log('  All app seed users share the password: Password123!');
    console.log('  Super admin login: jordan@youthtrend.cm / Password123!\n');
    console.log('  Campus admin logins:');
    console.log('    celestine.mbarga@uy1.cm / Password123!');
    console.log('    viviane.ndoumbe@ubuea.cm / Password123!');
    console.log('    sandrine.owono@iubs.cm / Password123!\n');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

console.log('\n[YouthTrend] Running seed...');
run().catch((err) => {
  console.error('\n[YouthTrend] Seed failed:', err.message);
  if (err.detail) console.error('  Detail:', err.detail);
  process.exit(1);
});
