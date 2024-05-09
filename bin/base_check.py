import json
import os
import sys
from datetime import datetime
from goplus.token import Token
from goplus.rug_pull import RugPull

def analyze_token(address, access_token, chain_id):
    try:
        # Analyze token security
        token_data = Token(access_token=access_token).token_security(
            chain_id=chain_id, addresses=[address]
        )

        # Analyze rug pull risk
        rug_pull_data = RugPull().rug_pull_security(
            chain_id=chain_id, address=address
        )

        # Combine the results into a single dictionary
        result = {
            "token_security": token_data.to_dict(),
            "rug_pull_security": rug_pull_data.to_dict()
        }

        return result

    except Exception as e:
        print(f"Error occurred during analysis: {str(e)}")
        return None

def generate_report(result, current_date):
    report = f"### Report - {current_date}\n\n"

    # Token Security Analysis Breakdown
    token_data = list(result["token_security"]["result"].values())
    if token_data:
        token_data = token_data[0]
        report += f"- Open Source: {'Yes' if token_data.get('is_open_source') == '1' else 'No' if token_data.get('is_open_source') == '0' else 'Unknown'}\n"
        report += f"- Proxy Contract: {'Yes' if token_data.get('is_proxy') == '1' else 'No' if token_data.get('is_proxy') == '0' else 'Unknown'}\n"
        report += f"- Mint Function: {'Yes' if token_data.get('is_mintable') == '1' else 'No' if token_data.get('is_mintable') == '0' else 'Unknown'}\n"
        report += f"- Owner Address: {token_data.get('owner_address', 'Unknown')}\n"
        report += f"- Can Take Back Ownership: {'Yes' if token_data.get('can_take_back_ownership') == '1' else 'No' if token_data.get('can_take_back_ownership') == '0' else 'Unknown'}\n"
        report += f"- Owner Can Change Balance: {'Yes' if token_data.get('owner_change_balance') == '1' else 'No' if token_data.get('owner_change_balance') == '0' else 'Unknown'}\n"
        report += f"- Hidden Owner: {'Yes' if token_data.get('hidden_owner') == '1' else 'No' if token_data.get('hidden_owner') == '0' else 'Unknown'}\n"
        report += f"- Selfdestruct: {'Yes' if token_data.get('selfdestruct') == '1' else 'No' if token_data.get('selfdestruct') == '0' else 'Unknown'}\n"
        report += f"- External Call: {'Yes' if token_data.get('external_call') == '1' else 'No' if token_data.get('external_call') == '0' else 'Unknown'}\n"
        report += f"- In DEX: {'Yes' if token_data.get('is_in_dex') == '1' else 'No' if token_data.get('is_in_dex') == '0' else 'Unknown'}\n"
        report += f"- Buy Tax: {token_data.get('buy_tax', 'Unknown')}\n"
        report += f"- Sell Tax: {token_data.get('sell_tax', 'Unknown')}\n"
        report += f"- Can't Buy: {'Yes' if token_data.get('cannot_buy') == '1' else 'No' if token_data.get('cannot_buy') == '0' else 'Unknown'}\n"
        report += f"- Can't Sell All: {'Yes' if token_data.get('cannot_sell_all') == '1' else 'No' if token_data.get('cannot_sell_all') == '0' else 'Unknown'}\n"
        report += f"- Slippage Modifiable: {'Yes' if token_data.get('slippage_modifiable') == '1' else 'No' if token_data.get('slippage_modifiable') == '0' else 'Unknown'}\n"
        report += f"- Honeypot: {'Yes' if token_data.get('is_honeypot') == '1' else 'No' if token_data.get('is_honeypot') == '0' else 'Unknown'}\n"
        report += f"- Transfer Pausable: {'Yes' if token_data.get('transfer_pausable') == '1' else 'No' if token_data.get('transfer_pausable') == '0' else 'Unknown'}\n"
        report += f"- Blacklist: {'Yes' if token_data.get('is_blacklisted') == '1' else 'No' if token_data.get('is_blacklisted') == '0' else 'Unknown'}\n"
        report += f"- Whitelist: {'Yes' if token_data.get('is_whitelisted') == '1' else 'No' if token_data.get('is_whitelisted') == '0' else 'Unknown'}\n"
        report += f"- Anti Whale: {'Yes' if token_data.get('is_anti_whale') == '1' else 'No' if token_data.get('is_anti_whale') == '0' else 'Unknown'}\n"
        report += f"- Anti Whale Modifiable: {'Yes' if token_data.get('anti_whale_modifiable') == '1' else 'No' if token_data.get('anti_whale_modifiable') == '0' else 'Unknown'}\n"
        report += f"- Trading Cooldown: {'Yes' if token_data.get('trading_cooldown') == '1' else 'No' if token_data.get('trading_cooldown') == '0' else 'Unknown'}\n"
        report += f"- Personal Slippage Modifiable: {'Yes' if token_data.get('personal_slippage_modifiable') == '1' else 'No' if token_data.get('personal_slippage_modifiable') == '0' else 'Unknown'}\n"
        report += f"- Token Name: {token_data.get('token_name', 'Unknown')}\n"
        report += f"- Token Symbol: {token_data.get('token_symbol', 'Unknown')}\n"
        report += f"- Holder Count: {token_data.get('holder_count', 'Unknown')}\n"
        report += f"- Total Supply: {token_data.get('total_supply', 'Unknown')}\n"
        report += f"- Creator Address: {token_data.get('creator_address', 'Unknown')}\n"
        report += f"- Creator Balance: {token_data.get('creator_balance', 'Unknown')}\n"
        report += f"- Creator Percent: {token_data.get('creator_percent', 'Unknown')}\n"
        report += f"- LP Holder Count: {token_data.get('lp_holder_count', 'Unknown')}\n"
        report += f"- LP Total Supply: {token_data.get('lp_total_supply', 'Unknown')}\n"
        report += f"- Is True Token: {'Yes' if token_data.get('is_true_token') == '1' else 'No' if token_data.get('is_true_token') == '0' else 'Unknown'}\n"
        report += f"- Is Airdrop Scam: {'Yes' if token_data.get('is_airdrop_scam') == '1' else 'No' if token_data.get('is_airdrop_scam') == '0' else 'Unknown'}\n"
        report += f"- Is In Trust List: {'Yes' if token_data.get('trust_list') == '1' else 'Unknown'}\n"

        fake_token = token_data.get('fake_token')
        if fake_token:
            report += f"- Fake Token: {'Yes' if fake_token['value'] == 1 else 'No'}\n"
            report += f"  - True Token Address: {fake_token['true_token_address']}\n"
        else:
            report += f"- Fake Token: Unknown\n"
    else:
        report += "No token security data available.\n"

    # Rug Pull Security Analysis Breakdown
    rug_pull_data = result["rug_pull_security"]["result"]
    if rug_pull_data:
        owner = rug_pull_data.get("owner")
        if owner:
            report += f"- Owner Name: {owner.get('owner_name', 'Unknown')}\n"
            report += f"- Owner Address: {owner.get('owner_address', 'Unknown')}\n"
            report += f"- Owner Type: {owner.get('owner_type', 'Unknown')}\n"
        else:
            report += "- Owner: No owner information available.\n"

        report += f"- Privilege Withdraw: {'Yes' if rug_pull_data.get('privilege_withdraw') == 1 else 'No' if rug_pull_data.get('privilege_withdraw') == 0 else 'Unknown'}\n"
        report += f"- Cannot Withdraw: {'Yes' if rug_pull_data.get('withdraw_missing') == 1 else 'No' if rug_pull_data.get('withdraw_missing') == 0 else 'Unknown'}\n"
        report += f"- Contract Verified: {'Yes' if rug_pull_data.get('is_open_source') == 1 else 'No'}\n"
        report += f"- Blacklist Function: {'Yes' if rug_pull_data.get('blacklist') == 1 else 'No' if rug_pull_data.get('blacklist') == 0 else 'Unknown'}\n"
        report += f"- Contract Name: {rug_pull_data.get('contract_name', 'Unknown')}\n"
        report += f"- Self-Destruct: {'Yes' if rug_pull_data.get('selfdestruct') == 1 else 'No' if rug_pull_data.get('selfdestruct') == 0 else 'Unknown'}\n"
        report += f"- Potential Approval Abuse: {'Yes' if rug_pull_data.get('approval_abuse') == 1 else 'No' if rug_pull_data.get('approval_abuse') == 0 else 'Unknown'}\n"
        report += f"- Proxy Contract: {'Yes' if rug_pull_data.get('is_proxy') == 1 else 'No' if rug_pull_data.get('is_proxy') == 0 else 'Unknown'}\n"
    else:
        report += "No rug pull security data available.\n"

    return report

def generate_report_for_network(result, current_date, network):
    report = f"## {network.capitalize()} Network\n\n"
    report += generate_report(result, current_date)
    return report

def main():
    if len(sys.argv) < 2:
        print("Please provide the relative path to the data.json file as a command-line argument.")
        return

    data_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), sys.argv[1])
    if not os.path.isfile(data_file):
        print(f"File not found: {data_file}")
        return

    with open(data_file, "r") as file:
        data = json.load(file)

    token_networks = {
        "ethereum": "1",
        "sepolia": "11155111",
        "base": "8453",
        "base-sepolia": "84532"
    }

    access_token = os.environ.get("GOPLUS_API_KEY")
    current_date = datetime.now().strftime("%Y-%m-%d")

    report = "# Token Analysis Results\n\n"
    for network, chain_id in token_networks.items():
        if network in data["tokens"]:
            address = data["tokens"][network]["address"]
            result = analyze_token(address, access_token, chain_id)
            if result:
                report += generate_report_for_network(result, current_date, network)
                report += "\n"
            else:
                print(f"Failed to analyze the token on {network} network.")

    if report.strip() == "# Token Analysis Results":
        print("No supported token networks found in the data.json file.")
    else:
        print(report.strip())

if __name__ == "__main__":
    main()