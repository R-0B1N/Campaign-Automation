@Getter
public enum DiscordTextKey {
    WRONG_GUILD("discord.error.wrong_guild",
            "Please use this command in the configured Discord Server."),
    MODAL_UID_LABEL("discord.modal.uid.label", "YUBIT UID"),
    MODAL_UID_PLACEHOLDER("discord.modal.uid.placeholder", "Enter your numeric UID"),
    MODAL_UID_TITLE("discord.modal.uid.title", "YUBIT Account Verification"),
    ACCESS_INVALID_UID("discord.access.invalid_uid",
            "⚠️ Invalid UID Format\nPlease provide your numeric YUBIT UID. Letters and special characters are not accepted."),
    ACCESS_USER_NOT_FOUND("discord.access.user_not_found",
            "⚠️ UID Not Found\n\nWe couldn't locate this UID in the system. Please verify the number and try again."),
    ACCESS_NOT_AFFILIATE("discord.access.not_affiliate",
            "⚠️ Verification Failed\n\nThis YUBIT UID isn't linked to my referral. Please register using the correct referral link."),
    ACCESS_BINDING_FAILED("discord.access.binding_failed",
            "Binding Failed\n\nAn internal error occurred during binding. Please try again later."),
    WELCOME_ENTER_UID_BUTTON("discord.welcome.enter_uid_button", "✅ Verify UID"),
    WELCOME_SIGN_UP_BUTTON("discord.welcome.sign_up_button", "🚀 Create YUBIT Account"),
    WELCOME_MESSAGE("discord.welcome.message",
            "Welcome to the YUBIT Community!\n\n"
                    + "We're excited to have you here! Before you can unlock VIP community access, just complete these quick steps:\n\n"
                    + "Step 1: Create your YUBIT account using my referral link.\n"
                    + "Step 2: Ensure your account meets the minimum balance requirement **(${assetLimit} USDT)**.\n"
                    + "Step 3: Click **\"Verify UID\"** below and enter your YUBIT UID 🚀\n\n"
                    + "Once you're verified, you'll automatically gain access to the VIP community. Welcome aboard! 🚀",
            Set.of("inviteCode", "assetLimit")),
    ROLE_GRANT_SUCCESS("discord.role.grant_success",
            "✅ Verification Complete\n\nCongratulations! Your UID has been successfully linked and your roles are updated."),
    ROLE_GUILD_MISSING("discord.role.guild_missing",
            "Discord Server does not exist or the Bot has not joined the target Server."),
    ROLE_MEMBER_MISSING("discord.role.member_missing",
            "Unable to identify the Discord member."),
    ROLE_NAME_REQUIRED("discord.role.name_required",
            "Discord Role Name cannot be empty."),
    ROLE_NOT_FOUND("discord.role.not_found",
            "Discord role does not exist: ${roleName}",
            Set.of("roleName")),
    ROLE_NOT_UNIQUE("discord.role.not_unique",
            "Discord role name is not unique: ${roleName}",
            Set.of("roleName")),
    ROLE_MISSING_PERMISSION("discord.role.missing_permission",
            "Bot is missing the Manage Roles permission."),
    ROLE_HIERARCHY_ERROR("discord.role.hierarchy_error",
            "Bot role must be higher than the target role: ${roleName}",
            Set.of("roleName")),
    ROLE_ASSIGN_FAILED("discord.role.assign_failed",
            "Failed to assign role: ${reason}",
            Set.of("reason")),
    VERIFY_ALREADY_BOUND("discord.verify.already_bound",
            "Account Already Linked\n\nYou have already bound your UID. No further action is required."),
    VERIFY_DISCORD_USER_BOUND("discord.verify.discord_user_bound",
            "⚠️ Conflict Detected\n\nThis Discord account has already bound a different UID."),
    VERIFY_UID_BOUND("discord.verify.uid_bound",
            "⚠️ UID Conflict\n\nThis UID has already been claimed by another Discord account. If this is an error, please contact an administrator."),

    private final String key;
    private final String fallback;
    private final Set<String> variables;

    DiscordTextKey(String key, String fallback) {
        this(key, fallback, Set.of());
    }

    DiscordTextKey(String key, String fallback, Set<String> variables) {
        this.key = key;
        this.fallback = fallback;
        this.variables = variables;
    }

    public boolean supportsVariable(String variableName) {
        return variables.contains(variableName);
    }
}