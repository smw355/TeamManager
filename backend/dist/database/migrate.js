"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigrations = runMigrations;
exports.seedData = seedData;
const connection_1 = require("./connection");
const migrations = [
    `
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  `,
    `
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('coach', 'parent', 'player', 'assistant_coach')) NOT NULL,
    team_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  `,
    `
  CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    sport VARCHAR(100) NOT NULL,
    season VARCHAR(100) NOT NULL,
    coach_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  `,
    `
  CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id),
    name VARCHAR(255) NOT NULL,
    number INTEGER NOT NULL,
    position VARCHAR(100),
    age INTEGER,
    parent_id UUID REFERENCES users(id),
    stats JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, number)
  );
  `,
    `
  CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id),
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('game', 'practice', 'meeting')) NOT NULL,
    date TIMESTAMP NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  `,
    `
  CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id),
    user_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    type VARCHAR(50) CHECK (type IN ('text', 'ai_response')) DEFAULT 'text',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  `,
    `
  ALTER TABLE users ADD CONSTRAINT fk_users_team_id FOREIGN KEY (team_id) REFERENCES teams(id);
  `,
    `
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_users_team_id ON users(team_id);
  CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id);
  CREATE INDEX IF NOT EXISTS idx_events_team_id ON events(team_id);
  CREATE INDEX IF NOT EXISTS idx_messages_team_id ON messages(team_id);
  CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
  `
];
async function runMigrations() {
    console.log('🚀 Running database migrations...');
    try {
        for (let i = 0; i < migrations.length; i++) {
            console.log(`Running migration ${i + 1}/${migrations.length}...`);
            await (0, connection_1.query)(migrations[i]);
        }
        console.log('✅ All migrations completed successfully!');
    }
    catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}
async function seedData() {
    console.log('🌱 Seeding sample data...');
    try {
        // Insert sample team
        const teamResult = await (0, connection_1.query)(`
      INSERT INTO teams (name, sport, season, coach_id) 
      VALUES ('Thunder Hawks', 'Soccer', 'Fall 2024', null)
      ON CONFLICT DO NOTHING
      RETURNING id
    `);
        const teamId = teamResult.rows[0]?.id;
        if (teamId) {
            // Insert sample users
            await (0, connection_1.query)(`
        INSERT INTO users (email, password_hash, name, role, team_id) VALUES
        ('coach@demo.com', '$2b$10$example', 'Sarah Johnson', 'coach', $1),
        ('parent@demo.com', '$2b$10$example', 'Mike Wilson', 'parent', $1),
        ('player@demo.com', '$2b$10$example', 'Alex Smith', 'player', $1),
        ('assistant@demo.com', '$2b$10$example', 'Jennifer Davis', 'assistant_coach', $1)
        ON CONFLICT (email) DO NOTHING
      `, [teamId]);
            // Insert sample players
            await (0, connection_1.query)(`
        INSERT INTO players (team_id, name, number, position, age, stats) VALUES
        ($1, 'Alex Smith', 10, 'Forward', 12, '{"goals": 5, "assists": 3}'),
        ($1, 'Jamie Lee', 7, 'Midfielder', 11, '{"goals": 2, "assists": 7}'),
        ($1, 'Taylor Brown', 1, 'Goalkeeper', 13, '{"saves": 25, "clean_sheets": 4}'),
        ($1, 'Morgan Davis', 15, 'Defender', 12, '{"tackles": 18, "blocks": 12}')
        ON CONFLICT (team_id, number) DO NOTHING
      `, [teamId]);
            // Insert sample events
            await (0, connection_1.query)(`
        INSERT INTO events (team_id, title, type, date, location, description) VALUES
        ($1, 'vs Blue Lightning', 'game', NOW() + INTERVAL '3 days', 'City Stadium', 'Championship quarter-final'),
        ($1, 'Team Practice', 'practice', NOW() + INTERVAL '1 day', 'School Field', 'Focus on passing drills'),
        ($1, 'Parent Meeting', 'meeting', NOW() + INTERVAL '7 days', 'Community Center', 'Discuss end of season party')
        ON CONFLICT DO NOTHING
      `, [teamId]);
        }
        console.log('✅ Sample data seeded successfully!');
    }
    catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    }
}
if (require.main === module) {
    (async () => {
        try {
            await runMigrations();
            await seedData();
            process.exit(0);
        }
        catch (error) {
            console.error('Database setup failed:', error);
            process.exit(1);
        }
    })();
}
//# sourceMappingURL=migrate.js.map