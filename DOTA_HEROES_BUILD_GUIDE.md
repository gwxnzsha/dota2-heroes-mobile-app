# Dota Heroes — Full Build Guide (Expo React Native + Freehostia PHP API)

This is a copy‑paste guide. Part 1 turns your existing `students.php` CRUD pattern into a `dota_heroes.php` API (testable in Postman, hosted on Freehostia). Part 2 is the full Expo React Native app that consumes it, styled to match your Magic Patterns reference (dark, minimal, cinematic).

---

## PART 0 — What you'll end up with

```
dota-heroes-api/          <- upload this to Freehostia
  connection.php          (yours, unchanged)
  auth.php                (yours, unchanged)
  dota_heroes.php         (new — replaces students.php pattern)
  schema.sql              (run once in phpMyAdmin)

DotaHeroes/                <- Expo app, run with `npx expo start`
  App.tsx
  app.json
  src/
    theme/colors.ts
    types/hero.ts
    api/config.ts
    api/heroes.ts
    navigation/AppNavigator.tsx
    screens/HomeScreen.tsx
    screens/HeroDetailScreen.tsx
    components/
      HeroCard.tsx
      HeroGrid.tsx
      HeroSearch.tsx
      AttributeFilter.tsx
      HeroStats.tsx
      AbilityCard.tsx
      LoadingSkeleton.tsx
      EmptyState.tsx
      ErrorState.tsx
```

---

## PART 1 — The PHP API (Freehostia)

### 1.1 Database schema

Run this once in phpMyAdmin on your Freehostia MySQL database.

```sql
CREATE TABLE dota_heroes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  attribute ENUM('strength','agility','intelligence','universal') NOT NULL,
  attack_type ENUM('melee','ranged') NOT NULL,
  roles VARCHAR(255) NOT NULL,          -- comma-separated, e.g. "Support,Carry,Durable"
  image VARCHAR(255) NOT NULL,          -- image URL
  description TEXT,                     -- lore
  health INT DEFAULT 0,
  mana INT DEFAULT 0,
  armor DECIMAL(4,1) DEFAULT 0,
  damage_min INT DEFAULT 0,
  damage_max INT DEFAULT 0,
  attack_range INT DEFAULT 0,
  attack_rate DECIMAL(4,2) DEFAULT 0,
  move_speed INT DEFAULT 0,
  turn_rate DECIMAL(4,2) DEFAULT 0,
  vision_day INT DEFAULT 0,
  vision_night INT DEFAULT 0,
  str_base DECIMAL(5,1) DEFAULT 0,
  str_gain DECIMAL(4,2) DEFAULT 0,
  agi_base DECIMAL(5,1) DEFAULT 0,
  agi_gain DECIMAL(4,2) DEFAULT 0,
  int_base DECIMAL(5,1) DEFAULT 0,
  int_gain DECIMAL(4,2) DEFAULT 0,
  abilities_json TEXT                   -- JSON array, see sample insert below
);

INSERT INTO dota_heroes
(name, attribute, attack_type, roles, image, description, health, mana, armor,
 damage_min, damage_max, attack_range, attack_rate, move_speed, turn_rate,
 vision_day, vision_night, str_base, str_gain, agi_base, agi_gain, int_base, int_gain,
 abilities_json)
VALUES
('Abaddon', 'universal', 'melee', 'Support,Carry,Durable',
 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/abaddon.png',
 'The Font of Avernus is the source of a family''s strength, a crack in primal stones from which vapors of prophetic power have issued for generations.',
 120, 75, -1, 22, 32, 150, 1.5, 325, 0.6, 1800, 800,
 21, 2.6, 22, 1.5, 18, 2,
 '[{"name":"Mist Coil","icon":"https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/abaddon_mist_coil.png","description":"Abaddon releases a coil of deathly mist that can damage an enemy unit or heal a friendly unit at the cost of some of Abaddon''s health."},{"name":"Aphotic Shield","icon":"https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/abaddon_aphotic_shield.png","description":"Summons dark energies around an ally unit, dispelling them and creating an all damage barrier that absorbs a set amount of damage."},{"name":"Curse of Avernus","icon":"https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/abaddon_frostmourne.png","description":"Abaddon strikes an enemy, affecting them with a chilling curse, slowing them, causing them to take damage over time, and all attacks against them to be critical."}]'
),
('Alchemist', 'strength', 'melee', 'Carry,Support,Initiator,Durable',
 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/alchemist.png',
 'No one is certain whether Razzil Darkbrew set out to be a hero or a madman, but no one can deny he has succeeded at being both.',
 140, 90, 1, 20, 30, 150, 1.7, 305, 0.6, 1800, 800,
 25, 3.1, 20, 1.6, 16, 1.8,
 '[{"name":"Acid Spray","icon":"","description":"Sprays a corrosive substance that reduces the armor of all enemy units in an area."},{"name":"Unstable Concoction","icon":"","description":"Brews an unstable concoction, throwing it to deal heavy damage in an area."}]'
);
```

Add more heroes the same way (or write a small seed script — ask if you want one).

### 1.2 `dota_heroes.php`

Same request-routing shape as your `students.php`, adapted for heroes. Upload this next to your existing `connection.php` and `auth.php`.

```php
<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}
include("connection.php");
include("auth.php");

//Auth Start
// $auth = new authObj();
// $isAuthorized = $auth->authenticate();
// if(!$isAuthorized)
// {
// 	header("HTTP/1.0 401");
// 	exit;
// }
//Auth End

$db = new dbObj();
$connection = $db->getConnstring();

$request_method = $_SERVER["REQUEST_METHOD"];
switch ($request_method) {
    case 'GET':
        if (!empty($_GET["id"])) {
            getHero(intval($_GET["id"]));
        } elseif (!empty($_GET["attribute"])) {
            searchHeroesByAttribute($_GET["attribute"]);
        } elseif (!empty($_GET["role"])) {
            searchHeroesByRole($_GET["role"]);
        } elseif (!empty($_GET["name"])) {
            searchHeroesByName($_GET["name"]);
        } else {
            getHeroes();
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        insertHero($data);
        break;

    case 'PUT':
        $id = intval($_GET["id"]);
        $data = json_decode(file_get_contents('php://input'), true);
        updateHero($id, $data);
        break;

    case 'DELETE':
        $id = intval($_GET["id"]);
        deleteHero($id);
        break;

    default:
        header("HTTP/1.0 405 Method Not Implemented");
        break;
}

function formatHero($row)
{
    $row['roles'] = array_map('trim', explode(',', $row['roles']));
    $row['abilities'] = json_decode($row['abilities_json'] ?? '[]', true) ?: [];
    unset($row['abilities_json']);
    return $row;
}

function getHeroes()
{
    global $connection;
    $sql = "SELECT * FROM dota_heroes ORDER BY name ASC";
    $result = $connection->query($sql);
    $response = array();
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            array_push($response, formatHero($row));
        }
    }
    header('Content-Type: application/json');
    echo json_encode($response);
}

function getHero($id)
{
    global $connection;
    $stmt = $connection->prepare("SELECT * FROM dota_heroes WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    header('Content-Type: application/json');
    echo json_encode($row ? formatHero($row) : null);
}

function insertHero($data)
{
    global $connection;
    $stmt = $connection->prepare(
        "INSERT INTO dota_heroes
        (name, attribute, attack_type, roles, image, description, health, mana, armor,
         damage_min, damage_max, attack_range, attack_rate, move_speed, turn_rate,
         vision_day, vision_night, str_base, str_gain, agi_base, agi_gain, int_base, int_gain, abilities_json)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
    );
    $abilities = json_encode($data['abilities'] ?? []);
    $stmt->bind_param(
        "sssssiiddiiidiiiddddddss",
        $data['name'], $data['attribute'], $data['attack_type'], $data['roles'],
        $data['image'], $data['description'], $data['health'], $data['mana'],
        $data['armor'], $data['damage_min'], $data['damage_max'], $data['attack_range'],
        $data['attack_rate'], $data['move_speed'], $data['turn_rate'], $data['vision_day'],
        $data['vision_night'], $data['str_base'], $data['str_gain'], $data['agi_base'],
        $data['agi_gain'], $data['int_base'], $data['int_gain'], $abilities
    );
    $response = array();
    if ($stmt->execute()) {
        http_response_code(201);
        $response = ['status' => 1, 'status_message' => 'Hero Added Successfully.'];
    } else {
        http_response_code(400);
        $response = ['status' => 0, 'status_message' => 'Hero Addition Failed.'];
    }
    header('Content-Type: application/json');
    echo json_encode($response);
}

function updateHero($id, $data)
{
    global $connection;
    $stmt = $connection->prepare(
    "UPDATE dota_heroes SET
      name=?, attribute=?, attack_type=?, roles=?, image=?, description=?,
      health=?, mana=?, armor=?, damage_min=?, damage_max=?, attack_range=?,
      attack_rate=?, move_speed=?, turn_rate=?, vision_day=?, vision_night=?,
      str_base=?, str_gain=?, agi_base=?, agi_gain=?, int_base=?, int_gain=?,
      abilities_json=?
    WHERE id=?"
    );
  if (!$stmt) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['status' => 0, 'status_message' => 'Prepare failed: ' . $connection->error]);
    exit();
  }

  $name = $data['name'] ?? '';
  $attribute = $data['attribute'] ?? 'universal';
  $attack_type = $data['attack_type'] ?? 'melee';
  $roles = $data['roles'] ?? '';
  $image = $data['image'] ?? '';
  $description = $data['description'] ?? '';
  $health = (float)($data['health'] ?? 0);
  $mana = (float)($data['mana'] ?? 0);
  $armor = (float)($data['armor'] ?? 0);
  $damage_min = (float)($data['damage_min'] ?? 0);
  $damage_max = (float)($data['damage_max'] ?? 0);
  $attack_range = (float)($data['attack_range'] ?? 0);
  $attack_rate = (float)($data['attack_rate'] ?? 0);
  $move_speed = (float)($data['move_speed'] ?? 0);
  $turn_rate = (float)($data['turn_rate'] ?? 0);
  $vision_day = (float)($data['vision_day'] ?? 0);
  $vision_night = (float)($data['vision_night'] ?? 0);
  $str_base = (float)($data['str_base'] ?? 0);
  $str_gain = (float)($data['str_gain'] ?? 0);
  $agi_base = (float)($data['agi_base'] ?? 0);
  $agi_gain = (float)($data['agi_gain'] ?? 0);
  $int_base = (float)($data['int_base'] ?? 0);
  $int_gain = (float)($data['int_gain'] ?? 0);
  $abilities_json = json_encode($data['abilities'] ?? [], JSON_UNESCAPED_SLASHES);

    $stmt->bind_param(
    'ssssss' . str_repeat('d', 17) . 'si',
    $name, $attribute, $attack_type, $roles, $image, $description,
    $health, $mana, $armor, $damage_min, $damage_max, $attack_range,
    $attack_rate, $move_speed, $turn_rate, $vision_day, $vision_night,
    $str_base, $str_gain, $agi_base, $agi_gain, $int_base, $int_gain,
    $abilities_json, $id
    );

    $response = array();
    if ($stmt->execute()) {
        $response = ['status' => 1, 'status_message' => 'Hero Updated Successfully.'];
    } else {
        http_response_code(400);
    $response = ['status' => 0, 'status_message' => 'Hero Update Failed: ' . $stmt->error];
    }
    header('Content-Type: application/json');
    echo json_encode($response);
}

function deleteHero($id)
{
    global $connection;
    $stmt = $connection->prepare("DELETE FROM dota_heroes WHERE id = ?");
    $stmt->bind_param("i", $id);
    $response = array();
    if ($stmt->execute()) {
        $response = ['status' => 1, 'status_message' => 'Hero Deleted.'];
    } else {
        http_response_code(400);
        $response = ['status' => 0, 'status_message' => 'Hero Deletion Failed.'];
    }
    header('Content-Type: application/json');
    echo json_encode($response);
}

function searchHeroesByAttribute($attribute)
{
    global $connection;
    $stmt = $connection->prepare("SELECT * FROM dota_heroes WHERE attribute = ? ORDER BY name ASC");
    $stmt->bind_param("s", $attribute);
    $stmt->execute();
    $result = $stmt->get_result();
    $response = array();
    while ($row = $result->fetch_assoc()) {
        array_push($response, formatHero($row));
    }
    header('Content-Type: application/json');
    echo json_encode($response);
}

function searchHeroesByRole($role)
{
    global $connection;
    $like = "%" . $role . "%";
    $stmt = $connection->prepare("SELECT * FROM dota_heroes WHERE roles LIKE ? ORDER BY name ASC");
    $stmt->bind_param("s", $like);
    $stmt->execute();
    $result = $stmt->get_result();
    $response = array();
    while ($row = $result->fetch_assoc()) {
        array_push($response, formatHero($row));
    }
    header('Content-Type: application/json');
    echo json_encode($response);
}

function searchHeroesByName($name)
{
    global $connection;
    $like = "%" . $name . "%";
    $stmt = $connection->prepare("SELECT * FROM dota_heroes WHERE name LIKE ? ORDER BY name ASC");
    $stmt->bind_param("s", $like);
    $stmt->execute();
    $result = $stmt->get_result();
    $response = array();
    while ($row = $result->fetch_assoc()) {
        array_push($response, formatHero($row));
    }
    header('Content-Type: application/json');
    echo json_encode($response);
}
```

**Note:** this uses `mysqli` prepared statements (`bind_param`) instead of string concatenation, since your original file builds raw SQL strings from `$_GET`/`$_POST` input, which is a SQL-injection risk (`'".$id."'`, etc.) even though it works for a class project. If your `connection.php` returns a `mysqli` connection (`getConnstring()`), `prepare()`/`bind_param()` will work as-is. If it returns a PDO object instead, tell me and I'll adjust the syntax.

### 1.3 Testing in Postman

Base URL, e.g.: `http://yourusername.freehostia.com/dota_heroes.php`

| Action | Method | URL | Body |
|---|---|---|---|
| List all heroes | GET | `dota_heroes.php` | — |
| Get one hero | GET | `dota_heroes.php?id=1` | — |
| Filter by attribute | GET | `dota_heroes.php?attribute=strength` | — |
| Filter by role | GET | `dota_heroes.php?role=Carry` | — |
| Search by name | GET | `dota_heroes.php?name=abad` | — |
| Add hero | POST | `dota_heroes.php` | raw JSON body (see below) |
| Update hero | PUT | `dota_heroes.php?id=1` | raw JSON body |
| Delete hero | DELETE | `dota_heroes.php?id=1` | — |

POST/PUT body (Postman → Body → raw → JSON):
```json
{
  "name": "Axe",
  "attribute": "strength",
  "attack_type": "melee",
  "roles": "Initiator,Durable,Disabler,Carry",
  "image": "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/axe.png",
  "description": "Mogul Khan, most feared of the Red Mist Mercenaries...",
  "health": 130, "mana": 75, "armor": 0,
  "damage_min": 27, "damage_max": 31, "attack_range": 150,
  "attack_rate": 1.7, "move_speed": 310, "turn_rate": 0.6,
  "vision_day": 1800, "vision_night": 800,
  "str_base": 25, "str_gain": 3.6,
  "agi_base": 20, "agi_gain": 1.6,
  "int_base": 18, "int_gain": 1.8,
  "abilities": [
    { "name": "Berserker's Call", "icon": "", "description": "Forces nearby enemies to attack Axe." }
  ]
}
```

Expected `GET dota_heroes.php` response shape (what the app will parse):
```json
[
  {
    "id": "1",
    "name": "Abaddon",
    "attribute": "universal",
    "attack_type": "melee",
    "roles": ["Support", "Carry", "Durable"],
    "image": "https://...png",
    "description": "The Font of Avernus...",
    "health": "120", "mana": "75", "armor": "-1.0",
    "damage_min": "22", "damage_max": "32",
    "attack_range": "150", "attack_rate": "1.50",
    "move_speed": "325", "turn_rate": "0.60",
    "vision_day": "1800", "vision_night": "800",
    "str_base": "21.0", "str_gain": "2.60",
    "agi_base": "22.0", "agi_gain": "1.50",
    "int_base": "18.0", "int_gain": "2.00",
    "abilities": [
      { "name": "Mist Coil", "icon": "https://...png", "description": "..." }
    ]
  }
]
```

Keep this checked against what Postman actually returns from your live Freehostia URL — MySQL returns numeric columns as strings over PHP by default, which is why the app's API layer (below) explicitly `Number()`-converts them.

---

## PART 2 — The Expo React Native App

### 2.1 Create the project

```bash
npx create-expo-app DotaHeroes -t expo-template-blank-typescript
cd DotaHeroes
npx expo install expo-linear-gradient @expo/vector-icons
npm install @react-navigation/native @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context
```

Run it any time with:
```bash
npx expo start
```
Scan the QR code with the **Expo Go** app on your phone (same Wi-Fi network as your computer).

> **Important for Expo Go + Freehostia:** your phone must be able to reach your Freehostia URL over plain internet — it will, since it's a public domain (not `localhost`). If you ever switch to a local PHP server instead, use your computer's LAN IP (e.g. `http://192.168.1.5/dota_heroes.php`), not `localhost`, since `localhost` on the phone means the phone itself.

### 2.2 `src/theme/colors.ts`

```ts
export const colors = {
  background: '#0D1117',
  surface: '#161B22',
  surfaceElevated: '#1C232D',
  border: 'rgba(255,255,255,0.08)',
  textPrimary: '#F5F6F7',
  textSecondary: '#8B949E',
  textMuted: '#6E7681',
  accent: '#E2543B',
  accentMuted: 'rgba(226,84,59,0.16)',
  strength: '#F2545B',
  agility: '#37D67A',
  intelligence: '#4FA9E8',
  universal: '#C879E8',
};

export const attributeColor = (attribute: string) => {
  switch (attribute?.toLowerCase()) {
    case 'strength': return colors.strength;
    case 'agility': return colors.agility;
    case 'intelligence': return colors.intelligence;
    default: return colors.universal;
  }
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const radii = { card: 18, chip: 999, sm: 10 };
```

### 2.3 `src/types/hero.ts`

```ts
export interface Ability {
  name: string;
  icon?: string;
  description: string;
}

export interface Hero {
  id: string;
  name: string;
  attribute: 'strength' | 'agility' | 'intelligence' | 'universal';
  attack_type: 'melee' | 'ranged';
  roles: string[];
  image: string;
  description?: string;
  health?: number;
  mana?: number;
  armor?: number;
  damage_min?: number;
  damage_max?: number;
  attack_range?: number;
  attack_rate?: number;
  move_speed?: number;
  turn_rate?: number;
  vision_day?: number;
  vision_night?: number;
  str_base?: number;
  str_gain?: number;
  agi_base?: number;
  agi_gain?: number;
  int_base?: number;
  int_gain?: number;
  abilities?: Ability[];
}
```

### 2.4 `src/api/config.ts`

```ts
// Replace this with your real Freehostia URL.
// Keep the .php filename exactly as it is on the server.
export const API_BASE_URL = 'http://YOUR-USERNAME.freehostia.com/dota_heroes.php';

// If you later move to a different host, this is the only line to change.
```

### 2.5 `src/api/heroes.ts`

All API logic and response-shape transformation lives here — screens and components never touch raw API fields.

```ts
import { API_BASE_URL } from './config';
import { Hero, Ability } from '../types/hero';

// Adapts one raw API row into the shape the UI expects.
// Keeping this isolated means if your PHP response changes,
// only this function needs to change.
function normalizeHero(raw: any): Hero {
  const rolesRaw = raw.roles;
  const roles: string[] = Array.isArray(rolesRaw)
    ? rolesRaw
    : typeof rolesRaw === 'string'
    ? rolesRaw.split(',').map((r: string) => r.trim()).filter(Boolean)
    : [];

  const abilitiesRaw = raw.abilities ?? raw.abilities_json ?? [];
  const abilities: Ability[] = Array.isArray(abilitiesRaw)
    ? abilitiesRaw
    : (() => {
        try {
          return JSON.parse(abilitiesRaw);
        } catch {
          return [];
        }
      })();

  return {
    id: String(raw.id ?? raw.hero_id ?? ''),
    name: raw.name ?? raw.localized_name ?? 'Unknown',
    attribute: (raw.attribute ?? raw.primary_attr ?? 'universal').toLowerCase(),
    attack_type: (raw.attack_type ?? 'melee').toLowerCase(),
    roles,
    image: raw.image ?? raw.img ?? raw.icon ?? '',
    description: raw.description ?? raw.lore ?? '',
    health: Number(raw.health) || undefined,
    mana: Number(raw.mana) || undefined,
    armor: raw.armor !== undefined ? Number(raw.armor) : undefined,
    damage_min: Number(raw.damage_min) || undefined,
    damage_max: Number(raw.damage_max) || undefined,
    attack_range: Number(raw.attack_range) || undefined,
    attack_rate: Number(raw.attack_rate) || undefined,
    move_speed: Number(raw.move_speed) || undefined,
    turn_rate: Number(raw.turn_rate) || undefined,
    vision_day: Number(raw.vision_day) || undefined,
    vision_night: Number(raw.vision_night) || undefined,
    str_base: Number(raw.str_base) || undefined,
    str_gain: Number(raw.str_gain) || undefined,
    agi_base: Number(raw.agi_base) || undefined,
    agi_gain: Number(raw.agi_gain) || undefined,
    int_base: Number(raw.int_base) || undefined,
    int_gain: Number(raw.int_gain) || undefined,
    abilities,
  };
}

async function request(path: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }
  return res.json();
}

export async function getHeroes(): Promise<Hero[]> {
  const data = await request('');
  if (!Array.isArray(data)) return [];
  return data.map(normalizeHero);
}

export async function getHeroById(id: string): Promise<Hero | null> {
  const data = await request(`?id=${encodeURIComponent(id)}`);
  if (!data) return null;
  return normalizeHero(data);
}

export async function getHeroesByAttribute(attribute: string): Promise<Hero[]> {
  const data = await request(`?attribute=${encodeURIComponent(attribute)}`);
  if (!Array.isArray(data)) return [];
  return data.map(normalizeHero);
}
```

### 2.6 `src/components/AttributeFilter.tsx`

```tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, radii, attributeColor } from '../theme/colors';

export type AttributeKey = 'all' | 'strength' | 'agility' | 'intelligence' | 'universal';

const OPTIONS: { key: AttributeKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'strength', label: 'Strength' },
  { key: 'agility', label: 'Agility' },
  { key: 'intelligence', label: 'Intelligence' },
  { key: 'universal', label: 'Universal' },
];

interface Props {
  selected: AttributeKey;
  onSelect: (key: AttributeKey) => void;
  counts?: Partial<Record<AttributeKey, number>>;
}

export default function AttributeFilter({ selected, onSelect, counts }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {OPTIONS.map((opt) => {
        const isActive = selected === opt.key;
        const dotColor = opt.key === 'all' ? colors.accent : attributeColor(opt.key);
        return (
          <TouchableOpacity
            key={opt.key}
            onPress={() => onSelect(opt.key)}
            activeOpacity={0.7}
            style={[styles.chip, isActive && styles.chipActive]}
          >
            <View style={[styles.dot, { backgroundColor: dotColor }]} />
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {opt.label}
            </Text>
            {counts?.[opt.key] !== undefined && (
              <Text style={styles.count}>{counts[opt.key]}</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radii.chip,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.accentMuted,
    borderColor: colors.accent,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  label: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  labelActive: { color: colors.textPrimary },
  count: { color: colors.textMuted, fontSize: 12, marginLeft: 2 },
});
```

### 2.7 `src/components/HeroCard.tsx`

```tsx
import React, { useRef } from 'react';
import { Animated, Image, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { colors, spacing, radii, attributeColor } from '../theme/colors';
import { Hero } from '../types/hero';

interface Props {
  hero: Hero;
  onPress: () => void;
}

const ATTR_ABBR: Record<string, string> = {
  strength: 'STR',
  agility: 'AGI',
  intelligence: 'INT',
  universal: 'UNI',
};

export default function HeroCard({ hero, onPress }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 40 }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40 }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={styles.card}
      >
        <View style={styles.imageWrap}>
          {hero.image ? (
            <Image source={{ uri: hero.image }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={[styles.image, styles.imageFallback]} />
          )}
          <View style={[styles.attrDot, { backgroundColor: attributeColor(hero.attribute) }]} />
        </View>
        <View style={styles.footer}>
          <Text style={styles.name} numberOfLines={1}>{hero.name.toUpperCase()}</Text>
          <Text style={[styles.attr, { color: attributeColor(hero.attribute) }]}>
            {ATTR_ABBR[hero.attribute] ?? ''}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  imageWrap: { width: '100%', aspectRatio: 1, position: 'relative' },
  image: { width: '100%', height: '100%' },
  imageFallback: { backgroundColor: colors.surfaceElevated },
  attrDot: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
  },
  name: { color: colors.textPrimary, fontSize: 12.5, fontWeight: '700', flex: 1, letterSpacing: 0.3 },
  attr: { fontSize: 10, fontWeight: '800', marginLeft: spacing.xs },
});
```

### 2.8 `src/components/HeroGrid.tsx`

```tsx
import React from 'react';
import { FlatList, RefreshControl } from 'react-native';
import HeroCard from './HeroCard';
import EmptyState from './EmptyState';
import { Hero } from '../types/hero';
import { colors, spacing } from '../theme/colors';

interface Props {
  heroes: Hero[];
  onSelect: (hero: Hero) => void;
  refreshing: boolean;
  onRefresh: () => void;
  emptyMessage?: string;
}

export default function HeroGrid({ heroes, onSelect, refreshing, onRefresh, emptyMessage }: Props) {
  return (
    <FlatList
      data={heroes}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={{ gap: spacing.sm, paddingHorizontal: spacing.md }}
      contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.xl, paddingTop: spacing.xs }}
      renderItem={({ item }) => (
        <HeroCard hero={item} onPress={() => onSelect(item)} />
      )}
      style={{ flex: 1 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.accent}
        />
      }
      ListEmptyComponent={<EmptyState message={emptyMessage ?? 'No heroes found.'} />}
      contentInsetAdjustmentBehavior="automatic"
    />
  );
}
```

Each card fades/scales in as it appears using `HeroCard`'s own press animation; if you also want an entrance fade per card, wrap the `renderItem` content in `Animated.View` with an opacity timing on mount — kept out by default to avoid FlatList re-render jank on large hero lists.

### 2.9 `src/components/HeroSearch.tsx`

```tsx
import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radii } from '../theme/colors';

interface Props {
  value: string;
  onChange: (text: string) => void;
}

export default function HeroSearch({ value, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      <Ionicons name="search" size={16} color={colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Search heroes..."
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChange('')} hitSlop={8}>
          <Ionicons name="close-circle" size={16} color={colors.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 44,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  input: { flex: 1, color: colors.textPrimary, fontSize: 14 },
});
```

### 2.10 `src/components/LoadingSkeleton.tsx`

```tsx
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { colors, spacing, radii } from '../theme/colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.md * 2 - spacing.sm) / 2;

function SkeletonCard() {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.9, duration: 650, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 650, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View style={[styles.card, { opacity, width: CARD_WIDTH }]}>
      <View style={styles.image} />
      <View style={styles.line} />
    </Animated.View>
  );
}

export default function LoadingSkeleton() {
  return (
    <View style={styles.grid}>
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
  },
  card: { backgroundColor: colors.surface, borderRadius: radii.card, overflow: 'hidden' },
  image: { width: '100%', aspectRatio: 1, backgroundColor: colors.surfaceElevated },
  line: { height: 12, margin: spacing.sm, borderRadius: 4, backgroundColor: colors.surfaceElevated },
});
```

### 2.11 `src/components/EmptyState.tsx`

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme/colors';

export default function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.wrap}>
      <Ionicons name="search-outline" size={28} color={colors.textMuted} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xl * 2, gap: spacing.sm },
  text: { color: colors.textSecondary, fontSize: 14 },
});
```

### 2.12 `src/components/ErrorState.tsx`

```tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radii } from '../theme/colors';

export default function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={styles.wrap}>
      <Ionicons name="alert-circle-outline" size={28} color={colors.accent} />
      <Text style={styles.text}>Unable to load heroes.</Text>
      <TouchableOpacity onPress={onRetry} style={styles.button} activeOpacity={0.8}>
        <Text style={styles.buttonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xl * 2, gap: spacing.md },
  text: { color: colors.textSecondary, fontSize: 14 },
  button: {
    backgroundColor: colors.accentMuted,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radii.chip,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
  },
  buttonText: { color: colors.accent, fontWeight: '700', fontSize: 13 },
});
```

### 2.13 `src/components/HeroStats.tsx`

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radii } from '../theme/colors';
import { Hero } from '../types/hero';

function Stat({ label, value }: { label: string; value: string | number | undefined }) {
  if (value === undefined || value === null) return null;
  return (
    <View style={styles.stat}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export default function HeroStats({ hero }: { hero: Hero }) {
  const rows: [string, string | number | undefined][] = [
    ['Health', hero.health],
    ['Mana', hero.mana],
    ['Armor', hero.armor],
    ['Damage', hero.damage_min && hero.damage_max ? `${hero.damage_min}-${hero.damage_max}` : undefined],
    ['Attack Range', hero.attack_range],
    ['Attack Rate', hero.attack_rate],
    ['Move Speed', hero.move_speed],
    ['Turn Rate', hero.turn_rate],
    ['Vision', hero.vision_day && hero.vision_night ? `${hero.vision_day} / ${hero.vision_night}` : undefined],
    ['Strength', hero.str_base && hero.str_gain ? `${hero.str_base} + ${hero.str_gain}` : undefined],
    ['Agility', hero.agi_base && hero.agi_gain ? `${hero.agi_base} + ${hero.agi_gain}` : undefined],
    ['Intelligence', hero.int_base && hero.int_gain ? `${hero.int_base} + ${hero.int_gain}` : undefined],
  ].filter(([, v]) => v !== undefined);

  if (rows.length === 0) return null;

  return (
    <View>
      <Text style={styles.heading}>STATISTICS</Text>
      <View style={styles.grid}>
        {rows.map(([label, value]) => (
          <Stat key={label} label={label} value={value} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  stat: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
  },
  label: { color: colors.textMuted, fontSize: 10.5, fontWeight: '700', letterSpacing: 0.5, marginBottom: 3 },
  value: { color: colors.textPrimary, fontSize: 15, fontWeight: '700' },
});
```

### 2.14 `src/components/AbilityCard.tsx`

```tsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors, spacing, radii } from '../theme/colors';
import { Ability } from '../types/hero';

export default function AbilityCard({ ability }: { ability: Ability }) {
  return (
    <View style={styles.card}>
      {ability.icon ? (
        <Image source={{ uri: ability.icon }} style={styles.icon} />
      ) : (
        <View style={[styles.icon, styles.iconFallback]} />
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{ability.name}</Text>
        <Text style={styles.desc}>{ability.description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  icon: { width: 44, height: 44, borderRadius: 8 },
  iconFallback: { backgroundColor: colors.surfaceElevated },
  name: { color: colors.textPrimary, fontSize: 13.5, fontWeight: '700', marginBottom: 3 },
  desc: { color: colors.textSecondary, fontSize: 12.5, lineHeight: 17 },
});
```

### 2.15 `src/screens/HomeScreen.tsx`

```tsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import HeroSearch from '../components/HeroSearch';
import AttributeFilter, { AttributeKey } from '../components/AttributeFilter';
import HeroGrid from '../components/HeroGrid';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import { getHeroes } from '../api/heroes';
import { Hero } from '../types/hero';
import { colors, spacing } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [attribute, setAttribute] = useState<AttributeKey>('all');

  const load = useCallback(async () => {
    setError(false);
    try {
      const data = await getHeroes();
      setHeroes(data);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const filtered = useMemo(() => {
    return heroes.filter((h) => {
      const matchesAttribute = attribute === 'all' || h.attribute === attribute;
      const matchesQuery = h.name.toLowerCase().includes(query.trim().toLowerCase());
      return matchesAttribute && matchesQuery;
    });
  }, [heroes, attribute, query]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: heroes.length };
    for (const h of heroes) c[h.attribute] = (c[h.attribute] ?? 0) + 1;
    return c;
  }, [heroes]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>DOTA HEROES</Text>
        <Text style={styles.subtitle}>Choose your hero</Text>
      </View>

      <HeroSearch value={query} onChange={setQuery} />
      <AttributeFilter selected={attribute} onSelect={setAttribute} counts={counts} />

      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorState onRetry={load} />
      ) : (
        <HeroGrid
          heroes={filtered}
          onSelect={(hero) => navigation.navigate('HeroDetail', { heroId: hero.id })}
          refreshing={refreshing}
          onRefresh={onRefresh}
          emptyMessage={query ? `No heroes match "${query}"` : 'No heroes found.'}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.md },
  title: { color: colors.textPrimary, fontSize: 26, fontWeight: '800', letterSpacing: 0.5 },
  subtitle: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
});
```

### 2.16 `src/screens/HeroDetailScreen.tsx`

```tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getHeroById } from '../api/heroes';
import { Hero } from '../types/hero';
import HeroStats from '../components/HeroStats';
import AbilityCard from '../components/AbilityCard';
import { colors, spacing, radii, attributeColor } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'HeroDetail'>;

export default function HeroDetailScreen({ route, navigation }: Props) {
  const { heroId } = route.params;
  const [hero, setHero] = useState<Hero | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    getHeroById(heroId)
      .then((h) => mounted && setHero(h))
      .catch(() => mounted && setError(true))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [heroId]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (error || !hero) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Unable to load this hero.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonAlt}>
          <Text style={styles.backText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        <View style={styles.heroImageWrap}>
          {hero.image ? (
            <Image source={{ uri: hero.image }} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <View style={[styles.heroImage, { backgroundColor: colors.surface }]} />
          )}
          <LinearGradient
            colors={['transparent', 'rgba(13,17,23,0.6)', colors.background]}
            style={StyleSheet.absoluteFill}
          />
          <SafeAreaView edges={['top']} style={styles.backWrap}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        <View style={styles.content}>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { borderColor: attributeColor(hero.attribute) }]}>
              <View style={[styles.badgeDot, { backgroundColor: attributeColor(hero.attribute) }]} />
              <Text style={[styles.badgeText, { color: attributeColor(hero.attribute) }]}>
                {hero.attribute.toUpperCase()}
              </Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeTextMuted}>{hero.attack_type.toUpperCase()}</Text>
            </View>
          </View>

          <Text style={styles.name}>{hero.name}</Text>

          {hero.roles.length > 0 && (
            <View style={styles.roleRow}>
              {hero.roles.map((role) => (
                <View key={role} style={styles.roleChip}>
                  <Text style={styles.roleText}>{role}</Text>
                </View>
              ))}
            </View>
          )}

          {!!hero.description && (
            <>
              <Text style={styles.sectionHeading}>LORE</Text>
              <Text style={styles.description}>{hero.description}</Text>
            </>
          )}

          <View style={styles.divider} />
          <HeroStats hero={hero} />

          {hero.abilities && hero.abilities.length > 0 && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionHeading}>ABILITIES</Text>
              {hero.abilities.map((a, i) => (
                <AbilityCard key={`${a.name}-${i}`} ability={a} />
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  errorText: { color: colors.textSecondary },
  backButtonAlt: {
    borderWidth: 1, borderColor: colors.accent, borderRadius: radii.chip,
    paddingHorizontal: spacing.lg, paddingVertical: 10,
  },
  backText: { color: colors.accent, fontWeight: '700' },
  heroImageWrap: { width: '100%', height: 380, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  backWrap: { position: 'absolute', top: 0, left: 0 },
  backButton: {
    marginLeft: spacing.md,
    marginTop: spacing.xs,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(13,17,23,0.55)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  content: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl, marginTop: -spacing.xl },
  badgeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: colors.border, borderRadius: radii.chip,
    paddingHorizontal: 10, paddingVertical: 5,
    backgroundColor: 'rgba(13,17,23,0.7)',
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 10.5, fontWeight: '800', letterSpacing: 0.5 },
  badgeTextMuted: { fontSize: 10.5, fontWeight: '800', letterSpacing: 0.5, color: colors.textSecondary },
  name: {
    color: colors.textPrimary, fontSize: 32, fontWeight: '800',
    letterSpacing: 0.3, marginBottom: spacing.sm,
  },
  roleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.md },
  roleChip: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radii.chip, paddingHorizontal: 10, paddingVertical: 5,
  },
  roleText: { color: colors.textSecondary, fontSize: 11.5, fontWeight: '600' },
  sectionHeading: {
    color: colors.textPrimary, fontSize: 13, fontWeight: '800',
    letterSpacing: 1, marginBottom: spacing.sm,
  },
  description: { color: colors.textSecondary, fontSize: 13.5, lineHeight: 20, marginBottom: spacing.md },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.lg },
});
```

### 2.17 `src/navigation/AppNavigator.tsx`

```tsx
import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import HeroDetailScreen from '../screens/HeroDetailScreen';
import { colors } from '../theme/colors';

export type RootStackParamList = {
  Home: undefined;
  HeroDetail: { heroId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.background, card: colors.background },
};

export default function AppNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom',
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="HeroDetail" component={HeroDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### 2.18 `App.tsx`

```tsx
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
```

---

## PART 3 — Run it

1. Edit `src/api/config.ts` and put your real Freehostia URL in `API_BASE_URL`.
2. Confirm the API works by hitting it directly in a browser or Postman first (Part 1.3).
3. From the project folder:
   ```bash
   npx expo start
   ```
4. Open **Expo Go** on your phone, scan the QR code shown in the terminal/browser.
5. If images don't load: check the `image` field your API actually returns matches what `normalizeHero()` expects (Part 2.5) — that's the one place to fix it.
6. If the app can't reach the API from your phone: make sure the phone has normal internet access (Freehostia is a public host, so Wi-Fi or mobile data both work) — this only breaks with `localhost`/LAN setups, not with a real domain.

---

## Notes on where things line up with your assignment requirements

- **Data comes from your own API, not hardcoded** — `src/api/heroes.ts` is the only file that talks to the network; every hero shown in the grid or detail screen is fetched at runtime.
- **API is Postman-testable** — Part 1.3 gives you the exact requests to demonstrate GET/POST/PUT/DELETE.
- **Same CRUD shape as your `students.php`** — `dota_heroes.php` mirrors your original file's request-routing structure (`switch` on `$_SERVER["REQUEST_METHOD"]`, one function per operation), just renamed and re-fielded for heroes, and switched to prepared statements so it's safe to demo without SQL-injection caveats.
- **Runs in Expo Go** — no native modules requiring a custom dev client are used (`expo-linear-gradient`, `@expo/vector-icons`, and `@react-navigation/*` are all Expo-Go-compatible).
