import { Bambu } from "bambu.ts"
import { getAccessCodesBySerialNumber, getIPAddressesBySerialNumber } from "../lib/bambu"
import * as Discord from 'discord.js';

type Errors = {
  type: "APP_CONFIG_ERROR",
  message: string
} | {
  type: "UNEXPECTED_MQTT_ERROR",
  message: string
} | {
  type: "ACCESS_CODE_ERROR"
}

type Result = {serialNumber: string} & ({ok: true} | {ok: false, error: Errors})



module.exports = {
	cron: '0 * */8 * * *',
	action: async (client: Discord.Client) => {
        const channelId = process.env.INCIDENTS_CHANNEL_ID
        if (!channelId) {
            console.log("Could not find incidents channel.")
            return
        }
        const serialNumbersToIpAddresses = await getIPAddressesBySerialNumber()
        const serialNumbersToAccessCodes = await getAccessCodesBySerialNumber()


        function verifyPrinterAccessCode(printerSerialNumber: string): Promise<Result> {
            return new Promise((res) => {
              const entry = serialNumbersToIpAddresses[printerSerialNumber]
              if (!entry) {
                return res({ok: false, error: {type:"APP_CONFIG_ERROR", message: "Entry missing"}, serialNumber: printerSerialNumber})
              }
              
              const {ip, name} = entry
              const accessCode = serialNumbersToAccessCodes[printerSerialNumber]
              
              if (!accessCode) {
                return res({ ok: false, error: { type: "APP_CONFIG_ERROR", message: "Access code missing" }, serialNumber: printerSerialNumber})
              }
              
              const b = new Bambu({
                host: ip,
                password: accessCode,
                serial: printerSerialNumber,
                autoconnect: true
              })
              
              b.on("connect", () => {
                b.client.end()
                return res({ok: true, serialNumber: printerSerialNumber})
                
              })
              
              b.client.on("error", (e) => {
                b.client.end()
                if (e.message === 'Connection refused: Not authorized') {
                    return res({ ok: false, error: { type: "ACCESS_CODE_ERROR" }, serialNumber: printerSerialNumber})
                }
                return res({ ok: false, error: { type: "UNEXPECTED_MQTT_ERROR", message: e.message }, serialNumber: printerSerialNumber})
              })
              
            })
            
          }


        const results = await Promise.all(Object.keys(serialNumbersToIpAddresses).map(verifyPrinterAccessCode))

        const channel = client.channels.cache.get(channelId)
        if (!channel || !(channel.type === Discord.ChannelType.GuildText)) {
            console.log("Could not find incidents channel")
            return
        }

        for (const result of results) {
            if (!result.ok) {
                
                const printer = serialNumbersToIpAddresses[result.serialNumber]
                if (result.error.type === "ACCESS_CODE_ERROR") {
                    await channel.send(`Printer ${printer.name} has an incorrect access code in the printer profile repo. Please update the access code in the repo.`)
                } else {
                    await channel.send(`Printer ${printer.name} error when checking access code.\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``)
                }
            }
        }

        console.log("✅ Bambu printer access codes have been checked.")
    },
    runOnStart: true
}