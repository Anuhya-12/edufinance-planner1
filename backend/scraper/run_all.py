from scraper.sbi import scrape_sbi
from scraper.hdfc import scrape_hdfc
from scraper.icici import scrape_icici
from scraper.kotak import scrape_kotak
from scraper.union import scrape_union
from scraper.bob import scrape_bob
from scraper.axis import scrape_axis
from scraper.credila import scrape_credila
from scraper.avanse import scrape_avanse
from db.supabase_client import supabase

def run_all():
    data = []
    data += scrape_sbi()
    data += scrape_hdfc()
    data += scrape_icici()
    data += scrape_kotak()
    data += scrape_union()
    data += scrape_bob()
    data += scrape_axis()
    data += scrape_credila()
    data += scrape_avanse()

    supabase.table("loans").upsert(data).execute()

if __name__ == "__main__":
    run_all()