export async function getAccessCodesBySerialNumber(): Promise<
  Record<string, string>
> {
  const res = await fetch(
    "https://github.com/utdesign-makerspace/printer-profiles/raw/refs/heads/main/bambu/codes.txt",
  );

  const text = await res.text();
  const lines = text.split("\n").map((line) => line.trim());

  const start = lines.indexOf('"user_access_code": {');
  if (start === -1) {
    throw new Error("Could not find user access code");
  }

  lines.splice(0, start);
  const end = lines.indexOf("}");
  if (end === -1) {
    throw new Error("Could not find end of user access code");
  }
  lines.splice(end + 1, lines.length - end);

  const newFragment = "{" + lines.join("") + "}";

  return JSON.parse(newFragment)["user_access_code"];
}


export async function getIPAddressesBySerialNumber() {
  // TODO: put printers into bitbot db
  return {
    "03919C443000082": { ip: "192.168.1.41", name: "Mercury (utd.ms)" },
    "03919C443000087": { ip: "192.168.1.51", name: "Venus (utd.ms)" },
    "03919C443000092": { ip: "192.168.1.41", name: "Mars (utd.ms)" },
    "03919C450801945": { ip: "192.168.1.49", name: "Neptune (utd.ms)" },
    "03919C450801968": { ip: "192.168.1.48", name: "Saturn w/ AMS (utd.ms)" },
    "03919C441902904": { ip: "192.168.1.40", name: "Uranus w/ AMS (utd.ms)" },
  } as Record<string, { ip: string, name: string }>
}