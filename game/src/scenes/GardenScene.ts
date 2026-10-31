
import Phaser from 'phaser';
import SoundService from '../audio/SoundService';

export default class GardenScene extends Phaser.Scene {

    // Personnage et contrôles
    private pix!: Phaser.Types.Physics.Arcade.GameObjectWithDynamicBody;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private interactKey!: Phaser.Input.Keyboard.Key;

    // Déplacements
    private readonly speed: number = 300;
    private readonly jumpSpeed: number = 450;

    // Pierre sonore
    private stone!: Phaser.GameObjects.Rectangle;
    private interactionText!: Phaser.GameObjects.Text;

    // Dialogue
    private dialogueText!: Phaser.GameObjects.Text;
    private isDialogueOpen: boolean = false;
    private questionText!: Phaser.GameObjects.Text;

    // Audio
    private soundService!: SoundService;
    private lowSoundButton!: Phaser.GameObjects.Text;
    private highSoundButton!: Phaser.GameObjects.Text;

    constructor() {
        super('GardenScene');
    }

    create(): void {

        // 1. Couleur du ciel
        this.cameras.main.setBackgroundColor('#87CEEB');

        // 2. Création du sol
        const ground = this.add.rectangle(
            640, 680, 1280, 80, 0x69A84F
        );

        this.physics.add.existing(ground, true);

        // 3. Création de Pix
        const pixRectangle = this.add.rectangle(
            150, 580, 60, 100, 0x555555
        );

        this.physics.add.existing(pixRectangle);

        this.pix = pixRectangle as
            Phaser.Types.Physics.Arcade.GameObjectWithDynamicBody;

        this.pix.body.setCollideWorldBounds(true);

        // Collision avec le sol
        this.physics.add.collider(this.pix, ground);

        // 4. Titre
        this.add.text(30, 30, 'Le Jardin de Pix', {
            fontSize: '32px',
            color: '#ffffff'
        });

        // 5. Contrôles clavier
        this.cursors = this.input.keyboard!.createCursorKeys();

        this.interactKey = this.input.keyboard!.addKey(
            Phaser.Input.Keyboard.KeyCodes.E
        );

        // 6. Pierre sonore
        this.stone = this.add.rectangle(
            950, 580, 80, 100, 0x8B6F9E
        );

        // 7. Message d'interaction
        this.interactionText = this.add.text(
            950, 490, 'E - Examiner',
            {
                fontSize: '24px',
                color: '#ffffff',
                backgroundColor: '#333333'
            }
        );

        this.interactionText.setOrigin(0.5);
        this.interactionText.setVisible(false);

        // 8. Dialogue de Pix
        this.dialogueText = this.add.text(
            640, 120,
            'Pix : Tiens ! Cette pierre semble produire des sons…',
            {
                fontSize: '26px',
                color: '#ffffff',
                backgroundColor: '#333333',
                padding: { x: 20, y: 15 },
                wordWrap: { width: 850 }
            }
        );

        this.dialogueText.setOrigin(0.5);
        this.dialogueText.setVisible(false);

        // 9. Initialisation du service audio
        this.soundService = new SoundService();

        // 10. Bouton son grave
        this.lowSoundButton = this.add.text(
            470, 200, 'Son grave',
            {
                fontSize: '26px',
                color: '#ffffff',
                backgroundColor: '#456B9A',
                padding: { x: 20, y: 12 }
            }
        );

        this.lowSoundButton.setOrigin(0.5);
        this.lowSoundButton.setInteractive({ useHandCursor: true });
        this.lowSoundButton.setVisible(false);

        // 11. Bouton son aigu
        this.highSoundButton = this.add.text(
            810, 200, 'Son aigu',
            {
                fontSize: '26px',
                color: '#ffffff',
                backgroundColor: '#A66A45',
                padding: { x: 20, y: 12 }
            }
        );

        this.highSoundButton.setOrigin(0.5);
        this.highSoundButton.setInteractive({ useHandCursor: true });
        this.highSoundButton.setVisible(false);

        this.lowSoundButton.disableInteractive();
        this.highSoundButton.disableInteractive();

        // Question musicale
        this.questionText = this.add.text(
            640, 300,
            'Lequel de ces deux sons est le plus grave ?',
            {
                fontSize: '28px',
                color: '#ffffff',
                backgroundColor: '#333333',
                padding: { x: 20, y: 15 }
            }
        );

        this.questionText.setOrigin(0.5);
        this.questionText.setVisible(false);

        // 12. Événements des boutons
        this.lowSoundButton.on('pointerdown', () => {
            this.soundService.playTone(220);
        });

        this.highSoundButton.on('pointerdown', () => {
            this.soundService.playTone(440);
        });
    }


update(): void {

    // Déplacement horizontal
    if (!this.isDialogueOpen && this.cursors.left.isDown) {
        this.pix.body.setVelocityX(-this.speed);
    }
    else if (!this.isDialogueOpen && this.cursors.right.isDown) {
        this.pix.body.setVelocityX(this.speed);
    }
    else {
        this.pix.body.setVelocityX(0);
    }

    // Saut
    if (
        !this.isDialogueOpen &&
        Phaser.Input.Keyboard.JustDown(this.cursors.space) &&
        this.pix.body.blocked.down
    ) {
        this.pix.body.setVelocityY(-this.jumpSpeed);
    }

    // Distance entre Pix et la pierre
    const distance = Phaser.Math.Distance.Between(
        this.pix.x,
        this.pix.y,
        this.stone.x,
        this.stone.y
    );

    const isNearStone = distance < 150;

    // Affichage du message d'interaction
    this.interactionText.setVisible(
        isNearStone && !this.isDialogueOpen
    );

    // Ouverture et fermeture du dialogue
    if (
        isNearStone &&
        Phaser.Input.Keyboard.JustDown(this.interactKey)
    ) {
        // Inversion de l'état du dialogue
        this.isDialogueOpen = !this.isDialogueOpen;

        // Affichage ou masquage des éléments
        this.dialogueText.setVisible(this.isDialogueOpen);
        this.lowSoundButton.setVisible(this.isDialogueOpen);
        this.highSoundButton.setVisible(this.isDialogueOpen);
        this.questionText.setVisible(this.isDialogueOpen);

        // Activation ou désactivation des boutons
        if (this.isDialogueOpen) {
            this.lowSoundButton.setInteractive({
                useHandCursor: true
            });

            this.highSoundButton.setInteractive({
                useHandCursor: true
            });
        }
        else {
            this.lowSoundButton.disableInteractive();
            this.highSoundButton.disableInteractive();
        }
    }
}

private checkAnswer(isCorrect: boolean): void {

    if (isCorrect) {
        console.log('Bonne réponse !');
    } else {
        console.log('Essaie encore !');
    }
}
}
