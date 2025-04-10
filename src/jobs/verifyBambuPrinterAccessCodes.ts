import { Bambu } from "bambu.ts"
import { getAccessCodesBySerialNumber, getIPAddressesBySerialNumber } from "../lib/bambu.js"
import * as Discord from 'discord.js';

type Errors = {
  type: "APP_CONFIG_ERROR",
  message: string
} | {
  type: "UNEXPECTED_MQTT_ERROR",
  message: string
}

type Result = {serialNumber: string} & ({ok: true} | {ok: false, error: Errors})



module.exports = {
	cron: '0 */15 * * * *',
	action: async (client: Discord.Client) => {
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
                return res({ ok: false, error: { type: "UNEXPECTED_MQTT_ERROR", message: e.message }, serialNumber: printerSerialNumber})
              })
              
            })
            
          }


        const results = await Promise.all(Object.keys(serialNumbersToIpAddresses).map(verifyPrinterAccessCode))

        for (const result of results) {
            if (!result.ok) {
                const channel = client.channels.cache.get(process.env.INCIDENTS_CHANNEL_ID)
                if (!channel || !(channel.type === Discord.ChannelType.GuildText)) {
                    console.log("Could not find incidents channel")
                    return
                }
                
                await channel.send(result.error.message)
            }
        }
    }
}