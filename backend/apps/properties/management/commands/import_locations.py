import csv
from pathlib import Path

from django.core.management.base import BaseCommand

from apps.properties.models import Location


class Command(BaseCommand):
    help = "Import locations from a CSV file"

    def handle(self, *args, **options):
        csv_path = (
            Path(__file__).resolve().parents[4]
            / "location_data"
            / "locations.csv"
        )

        if not csv_path.exists():
            self.stdout.write(
                self.style.ERROR(
                    f"CSV file not found: {csv_path}"
                )
            )
            return

        created_count = 0
        existing_count = 0

        with open(csv_path, "r", encoding="utf-8-sig") as file:
            reader = csv.DictReader(file)

            for row in reader:
                location, created = Location.objects.get_or_create(
                    city=row["city"].strip(),
                    sub_city=row["sub_city"].strip(),
                    woreda=row["woreda"].strip(),
                    neighborhood=row["neighborhood"].strip(),
                    defaults={
                        "latitude": (
                            float(row["latitude"])
                            if row["latitude"].strip()
                            else None
                        ),
                        "longitude": (
                            float(row["longitude"])
                            if row["longitude"].strip()
                            else None
                        ),
                    },
                )

                if created:
                    created_count += 1
                else:
                    existing_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Import complete: {created_count} created, "
                f"{existing_count} already existed."
            )
        )