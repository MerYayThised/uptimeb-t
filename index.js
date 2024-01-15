const { Client, GatewayIntentBits } = require('discord.js');
const { Database } = require('croxydb');
const db = new Database({ databaseName: 'croxydb.json' });

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const prefix = '/';

client.on('ready', () => {
  console.log(`Bot ${client.user.tag} olarak aktif!`);
});

client.on('messageCreate', async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'sistemkur') {
    // Uyarı mesajı ve butonlar
    const reply = await message.reply({
      content: 'Uptime sistemini kurmak için aşağıdaki butonlardan birini seçin:',
      components: [
        {
          type: 'ACTION_ROW',
          components: [
            { type: 'BUTTON', label: 'Ekle', customId: 'ekle', style: 'PRIMARY' },
            { type: 'BUTTON', label: 'Sil', customId: 'sil', style: 'DANGER' },
            { type: 'BUTTON', label: 'Linklerim', customId: 'linklerim', style: 'SECONDARY' },
          ],
        },
      ],
    });

    // Buton işlemleri
    const filter = (i) => i.customId === 'ekle' || i.customId === 'sil' || i.customId === 'linklerim';
    const collector = reply.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async (interaction) => {
      if (interaction.customId === 'ekle') {
        // "Ekle" butonuna basıldığında çalışacak kod
        await interaction.reply('Uptime etmek istediğiniz linki yazın:');
        
        const linkCollector = interaction.channel.createMessageCollector({ filter: m => m.author.id === message.author.id, time: 60000 });

        linkCollector.on('collect', async (collectedMessage) => {
          const uptimeLink = collectedMessage.content;
          // Burada uptimeLink'i croxydb'ye kaydedebilirsiniz
          db.set(message.author.id, uptimeLink);
          await interaction.followUp(`Link başarıyla kaydedildi: ${uptimeLink}`);
          linkCollector.stop();
        });

        linkCollector.on('end', (collected, reason) => {
          if (reason === 'time') {
            interaction.followUp('İşlem zaman aşımına uğradı. Lütfen tekrar deneyin.');
          }
        });
      } else if (interaction.customId === 'sil') {
        // "Sil" butonuna basıldığında çalışacak kod
        // Burada croxydb'den linki silebilirsiniz
        await interaction.reply('Uptime etmek istediğiniz linki yazın ve silme işlemini onaylayın:');
      } else if (interaction.customId === 'linklerim') {
        // "Linklerim" butonuna basıldığında çalışacak kod
        // Burada croxydb'den kullanıcının linklerini çekebilirsiniz
        const userLinks = db.get(message.author.id) || [];
        await interaction.reply(`Uptime edilen linkleriniz:\n${userLinks.join('\n')}`);
      }
    });

    collector.on('end', (collected, reason) => {
      if (reason === 'time') {
        reply.edit({ content: 'İşlem zaman aşımına uğradı. Lütfen tekrar deneyin.', components: [] });
      }
    });
  }
});

client.login('TOKEN'); // Botunuzun tokenini buraya ekleyin
