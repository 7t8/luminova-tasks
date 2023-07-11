const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "inviteinfo",
    description: "Displays information about an invite.",
    category: "Utility",
    options: [
        {
            name: 'code',
            description: 'Invite code',
            type: 'STRING',
            required: true
        }
    ],
    run: async (client, interaction) => {
        // First, I get the string that we required as an option for the slash command.
        let inviteCode = interaction.options.getString("code");

        // Now we'll use the fetchInvite function in client to fetch an InviteGuild object that we can read our needed data from.
        await client.fetchInvite(inviteCode).then(async (info) => {
            // Convert server ID to timestamp.
            let serverTimestamp = new Date(Number((BigInt(info.guild.id) >> 22n)) + 1420070400000)

            const inviteEmbed = new MessageEmbed()
            .setTitle("Invite Info")
            .setURL(`https://discord.gg/${info.code}`)
            .setFooter({text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({format: "png", dynamic: true, size: 64})})
            .setTimestamp()
            .setColor("#FFD900")
            .addFields(
                { name: "Server Name", value: info.guild.name, inline: true },
                { name: "Server ID", value: info.guild.id, inline: true },
                { name: 'Server Creation Time', value: `<t:${Math.round(serverTimestamp / 1000)}:F> (<t:${Math.round(serverTimestamp / 1000)}:R>)`, inline: false },
                { name: "Inviter", value: info.inviter ? info.inviter.username : "none", inline: true },
                { name: "Members", value: info.memberCount.toString(), inline: true },
                { name: "Online Members", value: info.presenceCount.toString(), inline: true },
            );

            if (info.guild.icon !== null) {
                let guildIconURL = `https://cdn.discordapp.com/icons/${info.guild.id}/${info.guild.icon}`;
                info.guild.features.indexOf("ANIMATED_ICON") !== -1 ? inviteEmbed.setThumbnail(`${guildIconURL}.gif?size=256`) : inviteEmbed.setThumbnail(`${guildIconURL}.jpg?size=256`);
            }

            if (info.guild.features.indexOf("INVITE_SPLASH") !== -1) {
                let inviteSplashURL = `https://cdn.discordapp.com/splashes/${info.guild.id}/${info.guild.splash}.jpg?size=1024`;
                inviteEmbed.setImage(inviteSplashURL);
            }
            
            return interaction.reply({embeds: [inviteEmbed]});
        }).catch(err => {
            const errorEmbed = new MessageEmbed()
            .setDescription("⛔ **Error**: Invalid/expired invite code/link.")
            .setFooter({text: interaction.guild.name, iconURL: interaction.guild.iconURL({format: "png", dynamic: true, size: 64})})
            .setTimestamp()
            .setColor("#FF0000");

            if (err.message.indexOf("Unknown Invite") == -1) {
                // This is incase the error isn't an actual "Unknown Invite" error and if it occurs and it's something else that's an issue it'll make it easier to track down as it'll get logged.
                console.log(err.stack);
            }

            return interaction.reply({embeds: [errorEmbed]});
        });
    },
};
